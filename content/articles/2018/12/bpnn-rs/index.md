---
postDate: "2018-12-25"
---

# BPNN 的向量化实现

在本篇文章中, 我会向你介绍**反向传播神经网络**的向量化原理和实现, 并用**Rust**语言编写出可运行的**BPNN**.

阅读本文需要对反向传播算法有一定了解, 请结合其他文章理解.

## 定义

+ $W^i_{n_{i+1}\times n_i}$: 第 $i$ 层的权重矩阵, 大小为  $n_{i+1}\times n_i$.

- $z^i_{n_i\times 1}$: 第 $i$ 层的输入向量, 大小为 $n_i\times 1$.

+ $a^i_{n_{i+1}\times 1}$: 第 $i$ 层的输出向量, 大小为 $n_{i+1}\times 1$.

- $\sigma_i(y)$: 第 $i$ 层的激活函数, 输入一个向量, 输出同样大小的向量.

+ $\sigma'_i(a)$: 第 $i$ 层的激活函数的导函数. 接收第 $i$ 层的输出向量, 返回 $a^i$ 关于 $W^i \cdot z^i$ 的导数向量.
  
- $C(t, o)$: 代价函数, 接收目标向量和网络的输出向量, 返回误差的评估值.

+ $C'(t, o)$: 代价函数的导函数, 接收目标向量和网络的输出向量, 返回代价函数关于输出向量的导数向量.

- $l$: 神经网络的层数, 不包括输入层

所有标号以 $0$ 为起始.


## 推导

在多层网络中, 前一层的输出是后一层的输入, 因此有
$$y^i_{n^{i+1}\times1} = W^i \cdot z^i $$

$$z^{i+1} = a^i = \sigma^i(y^i)$$

#### 第 $l-1$ 层 (最后一层):

$$ y_{n_{l}\times1} = W_{n_l\times n_{l-1}} \cdot z_{n_{l-1}\times1}$$

$$y_j = \sum_{k=0}^{n_{l-1}-1} {W_{jk} \cdot z_k}$$

$$a_j = \sigma(y_j) $$

$$
    \frac{\partial C}{\partial W_{jk}} = \frac{\partial C}{\partial a_j} \cdot \frac{\partial a_j} {\partial y_j} \cdot \frac{\partial y_j}{\partial W_{jk}}
$$

根据已有的函数定义

$$(\frac{\partial C}{\partial a})_{n_l\times1} = C'(t, o)$$

$$(\frac{\partial a}{\partial y})_{n_l\times1} = \sigma'(a)$$

设

$$\delta^{l-1}_{n_l\times1} =  \frac{\partial C}{\partial a} \odot \frac{\partial a} {\partial y} = \frac{\partial C}{\partial y^{l-1}}$$

回到上面的计算

$$\frac{\partial y_j}{\partial W_{jk}}= z_k$$


$$(\frac{\partial C}{\partial W})_{jk} = \delta_{j}\cdot z_k$$

对应矩阵点乘

$$(\frac{\partial y_j}{\partial W_{j}})_{1\times n_{l-1}}= z^T$$

$$(\frac{\partial C}{\partial W})_{n_l\times n_{l-1}} = \delta_{n^l\times1}\cdot (z^T)_{1\times n_{l-1}}$$

得到最后一层的参数更新公式

$$
    W^{l-1} := W^{l-1} - rate \cdot (\delta^{l-1}\cdot (z^{l-1})^T)
$$

其中 $rate$ 为学习率.

#### 第 ${i}$ 层 (非最后一层):

已有

$$\delta^{l-1}_{n_l\times1} =  \frac{\partial C}{\partial y^{l-1}}$$

则

$$
    \delta^{l-2} = \frac{\partial C}{\partial y^{l-2}} = \frac{\partial C}{\partial y^{l-1}} \cdot \frac{\partial y^{l-1}} {\partial z^{l-1}} \cdot \frac{\partial a^{l-2}}{\partial y^{l-2}}
$$
$$ \delta^{l-2} = \delta^{l-1} \cdot (W^{l-1})^T \cdot \sigma'_{l-2}(a^{l-2})
$$

根据维度分析

    
$$
\begin{aligned}
    \delta^{l-2}_{n_{l-1}\times1} = &((W^{l-1})^T_{n^{l-1}\times n^l} \cdot \delta^{l-1}_{n^l\times1}) \\
    &\odot (\sigma'_{l-2}(a^{l-2}))_{n^{l-1}\times1}
\end{aligned}
$$

归纳可得递推公式

$$
\delta^{i-1} = ((W^i)^T \cdot \delta^i) \odot \sigma'_{i-1}(z^i)
$$

对于第 $i$ 层

$$\delta^i_{n_{i+1}\times1} =  \frac{\partial C}{\partial y^i}$$

$$\frac{\partial C}{\partial W^{i}} = \frac{\partial C}{\partial y^i} \cdot \frac{\partial y^i}{\partial W^i} = \delta^{i}\cdot (z^i)^T$$

参数更新公式

$$
    W^i := W^i - rate \cdot (\delta^{i}\cdot (z^i)^T)
$$


## 动量梯度下降

$$ 
    C^i := -rate \cdot (\delta^{i}\cdot (z^i)^T) + factor \cdot C^i
$$

$$
    W^i := W^i + C^i
$$

其中 $factor$ 为动量因子.

## 流程分析

1. 输入向量为 $z^0$

$$
\begin{aligned}
z^{i+1} &= \sigma^i(W^i \cdot z^i),\\&\quad i=0,1,...,l-1       
\end{aligned}
$$

2. 输出向量 $o = z^l$, 目标向量 $t$
   $$\delta^{l-1} = C'(t, z^l) \odot \sigma'_{l-1}(z^{l})$$



3. 计算 $\delta^{i-1}$, $C^i$
        
$$
\begin{aligned}
    \delta^{i-1} = &((W^i)^T \cdot \delta^i) \odot \sigma'_{i-1}(z^i),\\& \quad i = l-1, l-2, ..., 1
\end{aligned}
$$

$$
\begin{aligned}
    C^i :=& -rate \cdot (\delta^{i}\cdot (z^i)^T) + factor \cdot C^i,\\& \quad i = l-1, l-2, ..., 1, 0    
\end{aligned}
$$

4. 更新 $W^i$
   $$W^i := W^i + C^i$$

---

## 第一步: 建立项目

从这里开始, 我们将进入到代码编写过程.

安装完 Rust工具链后, 建立项目

    cargo new bpnn-rs --edition 2018

在 Cargo.toml 中写入依赖

    [dependencies]
    ndarray = "0.12.1"
    rand = "0.6.1"

Cargo 会在构建时自动获取依赖并编译, 无需手动下载.

    cargo run

此时你应该看到熟悉的 "Hello World" 字样, 这代表新项目已经就绪.

## 第二步: 封装类型

    src/bpnn/types.rs

```rust
use ndarray::{Array1, Array2};

pub type Vector = Array1<f64>;
pub type Matrix = Array2<f64>;

pub type Activation = fn(x: &Vector) -> Vector;
pub type DActivation = fn(y: &Vector) -> Vector;

pub type Cost = fn(target: &Vector, output: &Vector) -> f64;
pub type DCost = fn(target: &Vector, output: &Vector) -> Vector;
```

需要注意的是, 激活函数的导函数以激活函数的输出作为输入, 有些资料与这里不同.

## 第三步: 编写工具函数

初始化参数是一个小功能, 因此把它抽出来作为工具函数.

    src/bpnn/utils.rs

```rust
use super::types::Matrix;
use ndarray::Array;
use rand::distributions::Uniform;
use rand::{thread_rng, Rng};

pub fn random_matrix(row_size: usize, col_size: usize) -> Matrix {
    let range = Uniform::new(-1., 1.);
    let v: Vec<f64> = thread_rng()
        .sample_iter(&range)
        .take(row_size * col_size)
        .collect();

    Array::from_shape_vec((row_size, col_size), v).unwrap()
}

pub fn zero_matrix(row_size: usize, col_size: usize) -> Matrix {
    Array::zeros((row_size, col_size))
}

```

## 第四步: 激活函数与代价函数

    src/bpnn/func.rs

```rust
use super::types::Vector;

pub fn tanh(x: &Vector) -> Vector {
        x.map(|f| f.tanh())
}

pub fn d_tanh(y: &Vector) -> Vector {
        y.map(|f| 1.0 - f * f)
}

pub fn sigmoid(x: &Vector) -> Vector {
        x.map(|f| 1.0 / (1.0 + (-f).exp()))
}

pub fn d_sigmoid(y: &Vector) -> Vector {
        y.map(|f| f * (1.0 - f))
}

pub fn relu(x: &Vector) -> Vector {
        x.map(|f| f.max(0.))
}

pub fn d_relu(y: &Vector) -> Vector {
        y.map(|f| if f.is_sign_positive() { 1. } else { 0. })
}

pub fn sse(target: &Vector, output: &Vector) -> f64 {
        target.iter()
                .zip(output.iter())
                .map(|(t, o)| (t - o) * (t - o))
                .sum::<f64>()
                / 2.
}

pub fn d_sse(target: &Vector, output: &Vector) -> Vector {
        output - target
}

```

其中 $sse$ 为和方差函数.

$$sse(t, o) = \frac{1}{2}\sum^{n_l-1}_{j=0}(t_j-o_j)^2$$

关于输出向量 $o$ 的分量 $o_j$ 的微分

$$\frac{\partial sse}{\partial o_j} = o_j-t_j$$

向量化

$$\frac{\partial sse}{\partial o} = o-t$$

## 第五步: 实现网络

引入模块, 定义网络

    src/bpnn.rs

```rust
mod func;
mod types;
mod utils;

pub use self::func::*;
pub use self::types::*;
pub use self::utils::*;

use ndarray::Array;

pub struct BPNN {
    weights: Vec<Matrix>,
    changes: Vec<Matrix>,
    activations: Vec<Activation>,
    d_activations: Vec<DActivation>,
    cost: Cost,
    d_cost: DCost,
}
```

实现 new 函数.

```rust
#[allow(non_snake_case)]
impl BPNN {
    pub fn new(
        input_size: usize,
        layer_settings: &Vec<(usize, Activation, DActivation)>,
        cost: Cost,
        d_cost: DCost,
    ) -> Self {
        let mut il = input_size + 1;
        let mut W: Vec<Matrix> = Vec::new();
        let mut C: Vec<Matrix> = Vec::new();
        let mut acts: Vec<Activation> = Vec::new();
        let mut d_acts: Vec<DActivation> = Vec::new();

        for (ol, act, d_act) in layer_settings {
            let ol = *ol;
            W.push(random_matrix(ol, il));
            C.push(zero_matrix(ol, il));
            acts.push(*act);
            d_acts.push(*d_act);
            il = ol;
        }

        Self {
            weights: W,
            changes: C,
            activations: acts,
            d_activations: d_acts,
            cost: cost,
            d_cost: d_cost,
        }
    }
}
```

在输入层引入偏置单元, 因此 input_size 要加一.

## 第六步: 反向传播

运用反向传播算法, 实现 train_once 函数.

```rust
#[allow(non_snake_case)]
impl BPNN {
    pub fn train_once(&mut self, input: &Vector, target: &Vector, rate: f64, factor: f64) -> f64 {
        let l = self.weights.len();

        assert_eq!(input.len(), self.weights[0].dim().1 - 1);
        assert_eq!(target.len(), self.weights[l - 1].dim().0);

        let W = &mut self.weights;
        let C = &mut self.changes;
        let activations = &self.activations;
        let d_activations = &self.d_activations;

        let mut z = vec![{
            let mut v = input.to_vec();
            v.push(1.);
            Array::from_vec(v)
        }];

        for i in 0..l {
            let x = &z[i];
            let y = W[i].dot(x);
            z.push((activations[i])(&y))
        }

        let mut delta = {
            let e = (self.d_cost)(target, &z[l]);
            let da = (d_activations[l - 1])(&z[l]);
            e * &da
        };

        let output = z.pop().unwrap();

        for i in (1..l).rev() {
            let new_delta = {
                let e = W[i].t().dot(&delta);
                let da = (d_activations[i - 1])(&z[i]);
                e * &da
            };

            let (ol, il) = C[i].dim();
            let delta_2d: Matrix = delta.into_shape((ol, 1)).unwrap();
            let z_i_t: Matrix = z.pop().unwrap().into_shape((1, il)).unwrap();

            C[i] *= factor;
            C[i].scaled_add(-rate, &delta_2d.dot(&z_i_t));

            delta = new_delta;
        }

        {
            let (ol, il) = C[0].dim();
            let delta_2d: Matrix = delta.into_shape((ol, 1)).unwrap();
            let z_i_t: Matrix = z.pop().unwrap().into_shape((1, il)).unwrap();

            C[0] *= factor;
            C[0].scaled_add(-rate, &delta_2d.dot(&z_i_t));
        }

        for i in 0..l {
            W[i] += &C[i];
        }

        (self.cost)(target, &output)
    }

    pub fn train(&mut self, patterns: &Vec<(Vector, Vector)>, rate: f64, factor: f64) -> f64 {
        patterns
            .into_iter()
            .map(|(ip, op)| self.train_once(ip, op, rate, factor))
            .sum()
    }
}
```

## 第七步: 测试

    src/bpnn.rs
```rust
impl BPNN {
    pub fn predict_once(&self, input: &Vector) -> Vector {
        let l = self.weights.len();

        assert_eq!(input.len(), self.weights[0].dim().1 - 1);

        let mut vector = {
            let mut v = input.to_vec();
            v.push(1.);
            Array::from_vec(v)
        };

        for i in 0..l {
            vector = (self.weights[i]).dot(&vector);
            vector = (self.activations[i])(&vector);
        }

        vector
    }

    pub fn predict(&self, inputs: &Vec<Vector>) -> Vec<Vector> {
        let mut v = Vec::new();
        for ip in inputs {
            v.push(self.predict_once(ip))
        }
        v
    }
}
```

    src/main.rs
```rust
mod bpnn;

fn main() {
    demo::run();
}

mod demo {
    use crate::bpnn::*;
    use ndarray::array;
    use std::iter::FromIterator;

    pub fn run() {
        let layer_settings: Vec<(usize, Activation, DActivation)> = vec![
            (3, tanh, d_tanh),
            (2, sigmoid, d_sigmoid),
            (1, relu, d_relu),
        ];

        let mut net = BPNN::new(2, &layer_settings, sse, d_sse);

        let patterns = vec![
            (array![0., 0.], array![0.]),
            (array![1., 0.], array![1.]),
            (array![0., 1.], array![1.]),
            (array![1., 1.], array![0.]),
        ];

        let rate = 0.5;
        let factor = 0.1;

        for i in 1..1001 {
            let total_error = net.train(&patterns, rate, factor);
            if i % 100 == 0 {
                println!("iteration: {:6}    error: {}", i, total_error);
            }
        }
        println!();

        let inputs = Vec::from_iter(patterns.into_iter().map(|(ip, _)| ip));
        let ops = net.predict(&inputs);
        for (ip, op) in inputs.into_iter().zip(ops.into_iter()) {
            println!("input: {}\noutput: {}\n", ip, op)
        }
    }
}

```

我们建立了一个4层的反向传播神经网络, 两个隐层分别使用 tanh 和 sigmoid 作为激活函数, 输出层使用 relu 作为激活函数.

使用异或函数的四组输入输出作为训练集, 学习率 0.5, 动量因子 0.1, 训练1000轮.

最后观察神经网络的输出, 评估效果.

    cargo run

    iteration:    100    error: 0.30448398750851796
    iteration:    200    error: 0.005346472979081161
    iteration:    300    error: 0.0023860491410121285
    iteration:    400    error: 0.0015207404375727116
    iteration:    500    error: 0.0011110886577935253
    iteration:    600    error: 0.0008731252828175259
    iteration:    700    error: 0.0007179746936274527
    iteration:    800    error: 0.0006089809511636514
    iteration:    900    error: 0.0005283005552871459
    iteration:   1000    error: 0.0004662187108590845

    input: [0, 0]
    output: [0.023382141961005735]

    input: [1, 0]
    output: [0.9998060885244202]

    input: [0, 1]
    output: [0.999824260760294]

    input: [1, 1]
    output: [0.01960148293751065]

简单的4层神经网络通过1000轮训练学会了异或函数.

#### 代码地址

[Nugine/bpnn-rs](https://github.com/Nugine/bpnn-rs)

如果本文对你有所帮助, 请为我的项目点个star.
