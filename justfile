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
    npx serve .output/public

dist: check lint
    ./scripts/dist.sh

clear-cache:
    rm -rf .cache
