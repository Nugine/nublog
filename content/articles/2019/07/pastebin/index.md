---
postDate: "2019-07-17"
---

# 设计个人pastebin后端服务

一个属于自己的pastebin服务需要什么功能？

后端：保存，查找，保存一段文本，根据url查找对应文本。还有过期删除机制，要能指定过期时间。

前端：Markdown渲染，数学公式渲染，代码高亮，代码行数显示，二维码分享，友好的预览界面。

有了这样的服务，在分享代码或文档的时候就能直接给出链接，方便自己的同时还能让人眼前一亮。

### 选型

首先预估数据量，按一周十次，每次 20KB 来算，就算保存半年，总占用也不过 5MB ，甚至能直接存进内存。

通常来说，找个 nodejs 的 web 框架，比如 koa，再连接 redis，随便写写就成了。

但是，这么小的数据量，这么简单的功能，真的有必要依赖 redis 和 nodejs 吗？

我想要的是一个没有依赖，能够独立运行的超轻量级高性能服务。一个二进制文件，加个 .env 配置文件就够了。

由此排除 nodejs, python, php 等需要配置环境的运行时。C/C++ 写起来也挺麻烦的。

在 Go 和 Rust 中，我选择 Rust。框架选用目前领跑 [TechEmpower](https://www.techempower.com/benchmarks/) 性能测试的 actix-web。数据存储使用自己封装的内存数据结构。

### 数据存储

服务的性质是匿名公开pastebin，虽然只有小范围使用，但仍要考虑大量数据的应对方法。

数据量不能无限增长，否则内存会被可能出现的大量保存请求撑爆。因此需要淘汰机制。对了，就是 LRU。当内存放不下时，直接删除最久远最少被访问的数据。这里不需要持久化，因为pastebin不提供数据可靠性的保证。

由此得出，主存储是 LinkedHashMap。这种数据结构提供 O(1) 的访问、插入和删除，但有可能出现扩容和哈希碰撞的额外消耗。链式结构便于实现 LRU 淘汰机制。

### 过期检测

最简单的过期检测就是定时遍历 LinkedHashMap，检查数据是否过期，删除所有过期的数据。

这种方法的时间复杂度是 O(n)，每个单位操作是访问、判断、删除，有两次哈希表操作。

优化一下，存储哈希键值和对应的过期时间，放入一个巨大的 vec 里，这样只需要二分查找，找到当前时间的 lowerbound，确定过期区间，遍历所有过期的键值并删除，最后删除 vec 中的过期区间。

这种方法的时间复杂度是 O(logn) + O(n) + O(n) 。但淘汰数据的时候，需要从 vec里删除对应的键值，会有 O(n) 的移动消耗。

过期检测的要求是有序遍历过期时间，删除对应的键，插入和删除时不能有大量的移动。因此，答案是平衡树，寻找最小键、插入、删除都是 O(logn)。具体是 BTreeMap，B 树是多叉平衡树，时间复杂度是 O(Blog(B,n))，少量的堆分配和 CPU 缓存友好性使它实际上比二叉平衡树快很多。

使用 B 树做过期索引会使保存的时间复杂度变为 O(Blog(B,n))，批量淘汰变为 O(nBlog(B,n))，过期删除变为 O(nBlog(B,n))，而查找仍是 O(1).

另起一个线程定时运行过期检测删除机制，为存储加个锁即可。

简单表达一下数据存储的类型

```rust
pub struct Store<K, V>{
    map: LinkedHashMap<K, V>
    queue: BTreeMap<DeadTime, K>
}
```

### 时间分析

后端存储有四种操作，保存，查找，LRU 淘汰机制和过期删除机制。其中保存和淘汰属于同一个API，查找是另一个，过期删除是内部操作。

对于所有场景，查找都是 O(1).

要触发大批量淘汰，只有让一个超大数据替换一堆小数据，这里的时间复杂度是 O(MAX/MIN)，设最大数据是 32KB，最小数据是 20B，单位操作只有数千次。一般情况下服务不会达到内存限制，大批量替换的概率非常低，而且不会连续发生，时间消耗可以忽略。

保存操作有可能触发淘汰，但耗时可以忽略，B 树的 O(Blog(B,n)) 插入操作实际上非常快，不用担心。

最耗时的就是过期删除操作了，一次完全回收耗时是 O(nBlog(B,n))，有可能造成长时间停顿。对于请求随时间均匀分布的场景，设每秒保存请求数为 q，删除一个数据用时为 t，过期删除检测周期为 d，那么每次回收用时占整个周期的比例为 q * d * t / d = q * t，与周期长度无关。

写完后做了压力测试，测定删除一个数据的平均用时实际上为数百到数千纳秒，极限 QPS 大约两万。当服务处于极限状态时，回收耗时大约 1% ~ 5%. 而在个人使用的场景中，QPS 要降三个数量级，百分之几微秒的停顿完全可以接受。

### 过期碰撞

过期索引是 BTreeMap<DeadTime, K>，这个过期时间是有可能碰撞的，如果不做处理，任由它碰撞替换，就会使被替换索引的数据永不过期，引起内存泄露。

首先处理过期时间的计算源头，过期时间 = 保存时间 + 过期时长。过期时长由外部指定，单位为秒，保存时间由服务器即时计算，单位为纳秒。如果有大量恶意请求想要碰撞，其碰撞范围长度为 10^9 ，参考生日攻击，理论上大约 10^5 个请求就能产生碰撞。实际测试时，观察到十几万个连续请求产生了数个碰撞。

处理碰撞就简单多了，这里使用了一个极其 naive 的做法。如果有碰撞，就将过期时间 +1s，直到没有碰撞。这种做法的可靠性基于概率，碰撞的概率极低，连续碰撞的概率小到可以忽略。

### 短网址

到这里我们有了一个基本可靠的内存 KV 存储，其中的键当然是以纳秒为单位的保存时间戳了。实践中，纳秒时间戳具有自增、不重复的特性，对于一个单机单线程服务来说，它就是完美的发号器。

```rust
pub type Store = store::Store<SavingTime, Record>
```

然而，直接将时间戳作为网址是有问题的，一是不好看，二是有可能被爆破，尽管概率极低。我们需要一个陷门单向函数作为映射，将时间戳转换成不可枚举的短字符串作为网址，查找时再转换回来。

幸运的是，Rust 已经有了这样的短网址库，没必要自己写了。

<https://github.com/magiclen/rust-short-crypt>

### 总结

通过以上分析，我们已经设计出了一个轻量级高性能pastebin后端服务方案，写完代码就像摘桃子一样简单了。数据结构的权衡比较是其中最有意思的地方，如果不经思考直接使用 redis 的话，就无法体会到设计的快感了。

单机压力测试时，极限 QPS 大约为两万，存储总量数百 MB 大小的十几万个数据时也能保持稳定。对于个人使用来说，这个性能上限足够高了。

<https://github.com/Nugine/pastebin-server>