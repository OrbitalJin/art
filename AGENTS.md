# Development Commands
- `bun dev` - Start development server
- `bun run build` - Build for production (runs `tsc -b && vite build`)
- `bun run lint` - Run ESLint
- `bun run preview` - Preview production build

# Code Style Guidelines
- Use TypeScript strict mode with proper type annotations
- Import alias: `@/*` maps to `./src/*`
- Follow React functional component patterns with hooks
- Use Tailwind CSS for styling with `cn()` utility from `@/lib/utils`
- UI components use class-variance-authority (CVA) for variants
- Prefer Radix UI primitives for accessible components
- Use async/await over promises with proper error handling
- Naming: PascalCase for components, camelCase for functions/variables
- File structure: Group by feature (components/, lib/, contexts/)
- No comments unless explicitly requested