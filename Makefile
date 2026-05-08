.PHONY: build
build:
	@echo "Building with tsup..."
	rm -rf dist
	pnpm tsup

.PHONY: test
test:
	pnpm nyc -a --reporter=html --reporter=text \
		mocha \
		--node-option import=tsx \
		--require jsdom-global/register \
		"tests/**/*.test.ts" \
		--timeout 300000 \
		--exit

.PHONY: lint
lint:
	@echo "Linting code..."
	./node_modules/.bin/eslint ./src --ext .js,.ts