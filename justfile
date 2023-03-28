dev:
    npx nuxt dev

fmt:
    npx prettier --write .

check:
    npx prettier --check .

lint:
    npx eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts

build: check lint
    npx nuxt typecheck
    npx nuxt generate

serve:
    npx serve .output/public

dist:
    ./scripts/dist.sh
