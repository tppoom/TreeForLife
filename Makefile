# ==============================================================================
# TreeForLife — Makefile
# Boutique Plant Catalog & Thai 3-Season Care Platform
# ==============================================================================

SHELL := /bin/bash
.DEFAULT_GOAL := help

# Styling / Colors
BOLD    := \033[1m
GREEN   := \033[32m
CYAN    := \033[36m
YELLOW  := \033[33m
MAGENTA := \033[35m
RESET   := \033[0m

.PHONY: help setup install clean clean-all dev build start typecheck lint \
        test test-watch test-care test-services test-garden test-today \
        test-admin test-catalog test-inquiry test-i18n \
        db-status db-species db-reset check verify ci status

# ------------------------------------------------------------------------------
# 1. HELP & OVERVIEW
# ------------------------------------------------------------------------------

help: ## Show this interactive help message with all available targets
	@echo -e "\n$(BOLD)$(GREEN)🌿 TreeForLife Development Commands$(RESET)\n"
	@echo -e "$(CYAN)Usage:$(RESET) make [target]\n"
	@echo -e "$(YELLOW)Setup & Maintenance:$(RESET)"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; $$1 ~ /^(setup|install|clean|clean-all)$$/ {printf "  $(BOLD)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo -e "\n$(YELLOW)Development & Build:$(RESET)"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; $$1 ~ /^(dev|build|start|typecheck|lint)$$/ {printf "  $(BOLD)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo -e "\n$(YELLOW)Automated Testing (Vitest):$(RESET)"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; $$1 ~ /^test/ {printf "  $(BOLD)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo -e "\n$(YELLOW)Database Utilities (PGlite):$(RESET)"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; $$1 ~ /^db-/ {printf "  $(BOLD)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo -e "\n$(YELLOW)Verification & CI:$(RESET)"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; $$1 ~ /^(check|verify|ci|status)$$/ {printf "  $(BOLD)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo -e ""

# ------------------------------------------------------------------------------
# 2. SETUP & MAINTENANCE
# ------------------------------------------------------------------------------

setup: install ## Initial setup: install dependencies, setup .env.local, and prepare .data
	@echo -e "$(CYAN)Configuring environment...$(RESET)"
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo -e "$(GREEN)✓ Created .env.local from .env.example$(RESET)"; \
	else \
		echo -e "$(YELLOW)• .env.local already exists$(RESET)"; \
	fi
	@mkdir -p .data/pglite
	@echo -e "$(GREEN)✓ TreeForLife workspace ready! Run 'make dev' to start.$(RESET)"

install: ## Install npm dependencies
	@echo -e "$(CYAN)Installing npm dependencies...$(RESET)"
	@npm install

clean: ## Clean Next.js cache and build output (.next)
	@echo -e "$(CYAN)Cleaning Next.js build output...$(RESET)"
	@rm -rf .next
	@echo -e "$(GREEN)✓ Cleaned .next$(RESET)"

clean-all: clean ## Clean Next.js cache, node_modules, and embedded PGlite database
	@echo -e "$(CYAN)Cleaning node_modules and .data/pglite...$(RESET)"
	@rm -rf node_modules .data/pglite
	@echo -e "$(GREEN)✓ Full cleanup complete$(RESET)"

# ------------------------------------------------------------------------------
# 3. DEVELOPMENT & BUILD
# ------------------------------------------------------------------------------

dev: ## Start local Next.js development server (http://localhost:3000)
	@echo -e "$(GREEN)Starting TreeForLife dev server...$(RESET)"
	@npm run dev

build: ## Build production Next.js application
	@echo -e "$(CYAN)Compiling production build...$(RESET)"
	@npm run build

start: ## Start production server (requires 'make build' first)
	@echo -e "$(GREEN)Starting production server...$(RESET)"
	@npm run start

typecheck: ## Check TypeScript types without emitting code
	@echo -e "$(CYAN)Running TypeScript type check...$(RESET)"
	@npx tsc --noEmit
	@echo -e "$(GREEN)✓ TypeScript check passed with 0 errors$(RESET)"

lint: ## Run linter
	@echo -e "$(CYAN)Running linter...$(RESET)"
	@npm run lint

# ------------------------------------------------------------------------------
# 4. TESTING SUITES (VITEST)
# ------------------------------------------------------------------------------

test: ## Run the complete Vitest test suite (all 158 tests)
	@echo -e "$(CYAN)Running all test suites...$(RESET)"
	@npm run test

test-watch: ## Run tests in interactive watch mode
	@npm run test:watch

test-care: ## Run Thai 3-Season Care Schedule Engine tests
	@npx vitest run lib/care/scheduler.test.ts

test-services: ## Run Domain Services tests (Species, Garden, Inquiry, Admin)
	@npx vitest run lib/services/services.test.ts

test-garden: ## Run My Garden & 4-Step Add Wizard tests
	@npx vitest run test/garden.test.tsx

test-today: ## Run Today's Tasks Dashboard tests
	@npx vitest run test/today.test.tsx

test-admin: ## Run Shop Admin Dashboard & Stock Toggle tests
	@npx vitest run test/admin.test.tsx

test-catalog: ## Run Catalog, Faceted Search & Plant Detail tests
	@npx vitest run test/catalog-search-detail.test.ts

test-inquiry: ## Run LINE Inquiry Modal & Handoff tests
	@npx vitest run test/inquiry-modal.test.tsx

test-i18n: ## Run Bilingual Translation Dictionary completeness tests
	@npx vitest run lib/i18n/translations.test.ts

# ------------------------------------------------------------------------------
# 5. DATABASE UTILITIES (PGLITE)
# ------------------------------------------------------------------------------

db-status: ## Check row counts across all embedded PGlite tables
	@node -e ' \
		const { PGlite } = require("@electric-sql/pglite"); \
		(async () => { \
			const pg = new PGlite(".data/pglite"); \
			const tables = ["species", "care_templates", "species_media", "species_problems", "user_plants", "care_tasks", "inquiries", "search_misses"]; \
			console.log("\n📦 \x1b[1m\x1b[32mTreeForLife PGlite Database Status:\x1b[0m\n" + "=".repeat(46)); \
			for (const t of tables) { \
				try { \
					const res = await pg.query("SELECT COUNT(*) as count FROM " + t + ";"); \
					console.log("  • \x1b[36m" + t.padEnd(20) + "\x1b[0m : \x1b[1m" + res.rows[0].count + "\x1b[0m rows"); \
				} catch (err) { \
					console.log("  • \x1b[33m" + t.padEnd(20) + "\x1b[0m : [table not created]"); \
				} \
			} \
			console.log("=".repeat(46) + "\n"); \
		})();'

db-species: ## List all 30 boutique species currently seeded in the database
	@node -e ' \
		const { PGlite } = require("@electric-sql/pglite"); \
		(async () => { \
			const pg = new PGlite(".data/pglite"); \
			const res = await pg.query("SELECT slug, name_th, name_en, stock_status FROM species ORDER BY name_th ASC;"); \
			console.log("\n🌿 \x1b[1m\x1b[32mSeeded Thai Species (" + res.rows.length + "):\x1b[0m\n" + "=".repeat(65)); \
			res.rows.forEach((r, i) => { \
				const idx = String(i + 1).padStart(2, " "); \
				const name = (r.name_th + " (" + r.name_en + ")").padEnd(42, " "); \
				const status = r.stock_status === "in_stock" ? "\x1b[32min_stock\x1b[0m" : "\x1b[33m" + r.stock_status + "\x1b[0m"; \
				console.log("  " + idx + ". " + name + " [" + status + "]"); \
			}); \
			console.log("=".repeat(65) + "\n"); \
		})();'

db-reset: ## Reset embedded PGlite database and re-seed 30 species
	@echo -e "$(YELLOW)Resetting embedded PGlite database (.data/pglite)...$(RESET)"
	@rm -rf .data/pglite
	@mkdir -p .data/pglite
	@node -e ' \
		const { PGlite } = require("@electric-sql/pglite"); \
		const { SCHEMA_DDL } = require("./lib/db/schema-ddl"); \
		(async () => { \
			const pg = new PGlite(".data/pglite"); \
			await pg.exec(SCHEMA_DDL); \
			console.log("\x1b[32m✓ Schema created\x1b[0m"); \
		})();'
	@echo -e "$(GREEN)✓ PGlite database reset. Run 'make test' or 'make dev' to re-seed.$(RESET)"

# ------------------------------------------------------------------------------
# 6. VERIFICATION & CI
# ------------------------------------------------------------------------------

check: typecheck test ## Fast pre-commit check (typecheck + test)

verify: typecheck test build ## Full end-to-end verification (typecheck + test + production build)
	@echo -e "\n$(BOLD)$(GREEN)🎉 All verification gates passed cleanly! Ready to ship.$(RESET)\n"

ci: verify ## Alias for verify (CI pipeline)

status: ## Show Git working tree status
	@git status -s
