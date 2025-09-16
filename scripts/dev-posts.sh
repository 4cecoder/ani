#!/bin/bash

# Posts Module Development Workflow
# Optimized development environment for posts-related components

set -e

echo "🚀 Starting Posts Development Environment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_files() {
    print_status "Checking posts files..."
    local files=(
        "components/ui/post-card.tsx"
        "components/ui/post-composer.tsx"
        "components/ui/posts-feed.tsx"
        "components/ui/search-posts.tsx"
        "convex/posts.ts"
    )

    local missing=()
    for file in "${files[@]}"; do
        if [[ ! -f "$file" ]]; then
            missing+=("$file")
        fi
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
        print_error "Missing files: ${missing[*]}"
        return 1
    fi

    print_success "All posts files found"
    return 0
}

# Run linting
run_lint() {
    print_status "Running ESLint on posts files..."
    if npx eslint components/ui/post-*.tsx convex/posts.ts --fix --quiet; then
        print_success "ESLint passed"
        return 0
    else
        print_warning "ESLint found issues"
        return 1
    fi
}

# Run type checking
run_types() {
    print_status "Running TypeScript check..."
    if npx tsc --noEmit --project tsconfig.posts.json; then
        print_success "TypeScript check passed"
        return 0
    else
        print_error "TypeScript check failed"
        return 1
    fi
}

# Start development server
start_dev() {
    print_status "Starting optimized development server..."
    print_status "Hot reload enabled for posts components"
    print_status "Press Ctrl+C to stop"

    # Set environment variables for optimized development
    export NODE_OPTIONS="--max-old-space-size=4096"
    export NEXT_TELEMETRY_DISABLED=1

    # Start server with optimized settings
    npm run dev:fast
}

# Watch mode
watch_mode() {
    print_status "Starting watch mode for posts files..."

    # Use fswatch or inotifywait if available, otherwise use a simple loop
    if command -v fswatch &> /dev/null; then
        print_status "Using fswatch for file watching"
        fswatch -o components/ui/post-*.tsx convex/posts.ts | while read; do
            print_status "Files changed, running checks..."
            run_lint
            run_types
        done
    else
        print_warning "fswatch not found, using basic file watching"
        print_warning "Install fswatch for better performance: brew install fswatch"

        # Simple watch implementation
        local last_check=$(date +%s)
        while true; do
            sleep 2
            local current_time=$(date +%s)
            local time_diff=$((current_time - last_check))

            if [[ $time_diff -gt 5 ]]; then
                if run_lint && run_types; then
                    last_check=$current_time
                fi
            fi
        done
    fi
}

# Main function
main() {
    local command=${1:-"dev"}

    case $command in
        "check")
            check_files
            run_lint
            run_types
            ;;
        "lint")
            run_lint
            ;;
        "types")
            run_types
            ;;
        "dev")
            if check_files && run_lint && run_types; then
                start_dev
            else
                print_error "Pre-checks failed. Fix issues before starting dev server."
                exit 1
            fi
            ;;
        "watch")
            watch_mode
            ;;
        "build")
            print_status "Building posts components..."
            npm run build:posts
            ;;
        *)
            echo "Posts Development Workflow"
            echo "Usage: $0 <command>"
            echo ""
            echo "Commands:"
            echo "  check    - Run all checks (files, lint, types)"
            echo "  lint     - Run ESLint on posts files"
            echo "  types    - Run TypeScript check"
            echo "  dev      - Start development server (with pre-checks)"
            echo "  watch    - Watch files and run checks on changes"
            echo "  build    - Build posts components"
            echo ""
            echo "Examples:"
            echo "  ./scripts/dev-posts.sh check"
            echo "  ./scripts/dev-posts.sh dev"
            echo "  ./scripts/dev-posts.sh watch"
            ;;
    esac
}

# Run main function with all arguments
main "$@"