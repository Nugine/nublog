dev:
    npx nuxt dev

fmt:
    npx prettier --write .

check:
    npx prettier --check .

lint:
    npx eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts

build:
    npx nuxt typecheck
    npx nuxt generate

serve:
    #!/bin/bash -ex
    cd {{justfile_directory()}}
    npx serve .output/public

dist:
    #!/bin/bash -ex
    cd {{justfile_directory()}}
    ./scripts/dist.sh

clear-cache:
    #!/bin/bash -ex
    cd {{justfile_directory()}}
    rm -rf .cache
    rm -rf node_modules/.vite
