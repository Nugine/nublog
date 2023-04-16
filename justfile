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

dist:
    ./scripts/dist.sh

clear-cache:
    rm -rf .cache
    rm -rf node_modules/.vite
