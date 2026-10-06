import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const ROOT_DIR = path.resolve('E:/anchor');

console.log('--- STARTING EMPIRICAL CHALLENGER 2 VERIFICATION SUITE ---');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    throw err;
  }
}

// ==========================================
// TEST 1: Package Dependencies & Icon Audit
// ==========================================
runTest('Audit package.json for zero prohibited icon libraries', () => {
  const pkgPath = path.join(ROOT_DIR, 'package.json');
  assert(fs.existsSync(pkgPath), 'package.json must exist');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
  
  const prohibitedLibraries = [
    'lucide-react',
    'lucide',
    'react-icons',
    '@heroicons/react',
    '@tabler/icons',
    'feather-icons',
    '@fortawesome/react-fontawesome',
    '@radix-ui/react-icons',
  ];
  
  for (const lib of prohibitedLibraries) {
    assert.strictEqual(
      Boolean(allDeps[lib]),
      false,
      `Prohibited icon library '${lib}' found in package.json!`
    );
  }
  
  assert(
    Boolean(allDeps['@mui/icons-material']),
    '@mui/icons-material must be present in dependencies'
  );
  assert(
    Boolean(allDeps['@mui/material']),
    '@mui/material must be present in dependencies'
  );
});

// ==========================================
// TEST 2: Source Code Import Scan for Icons
// ==========================================
runTest('Scan all src files for prohibited icon imports', () => {
  function getFiles(dir) {
    const subdirs = fs.readdirSync(dir);
    const files = subdirs.map((subdir) => {
      const res = path.resolve(dir, subdir);
      return fs.statSync(res).isDirectory() ? getFiles(res) : res;
    });
    return files.reduce((a, f) => a.concat(f), []);
  }

  const srcFiles = getFiles(path.join(ROOT_DIR, 'src')).filter(
    (f) => f.endsWith('.ts') || f.endsWith('.tsx')
  );

  const prohibitedPatterns = [
    /from\s+['"]lucide-react['"]/,
    /from\s+['"]react-icons/,
    /from\s+['"]@heroicons/,
    /from\s+['"]feather-icons/,
    /from\s+['"]@fortawesome/,
    /from\s+['"]@tabler\/icons/,
  ];

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of prohibitedPatterns) {
      assert(
        !pattern.test(content),
        `Prohibited icon import pattern ${pattern} found in file: ${file}`
      );
    }
  }
});

// ==========================================
// TEST 3: Layout Breakpoint Switching Logic
// ==========================================
runTest('Verify breakpoint synchronization across layout components', () => {
  const appShellContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src/components/layout/AppShell.tsx'),
    'utf8'
  );
  const desktopSidebarContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src/components/layout/DesktopSidebar.tsx'),
    'utf8'
  );
  const topHeaderContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src/components/layout/TopHeader.tsx'),
    'utf8'
  );
  const mobileTopBarContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src/components/layout/MobileTopBar.tsx'),
    'utf8'
  );
  const mobileBottomNavContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src/components/layout/MobileBottomNav.tsx'),
    'utf8'
  );

  // 1. DesktopSidebar must be hidden on mobile/tablet and visible on lg+
  assert(
    desktopSidebarContent.includes(`display: { xs: "none", lg: "flex" }`),
    'DesktopSidebar must have display { xs: "none", lg: "flex" }'
  );
  assert(
    topHeaderContent.includes('export default function TopHeader'),
    'TopHeader must export TopHeader component'
  );

  // 2. TopHeader wrapper in AppShell must be hidden on mobile/tablet and visible on lg+
  assert(
    appShellContent.includes(`display: { xs: "none", lg: "block" }`),
    'AppShell must hide TopHeader on mobile/tablet: display: { xs: "none", lg: "block" }'
  );

  // 3. MobileTopBar must be visible on mobile/tablet and hidden on lg+
  assert(
    mobileTopBarContent.includes(`display: { xs: "flex", lg: "none" }`),
    'MobileTopBar must have display { xs: "flex", lg: "none" }'
  );

  // 4. MobileBottomNav must be visible on mobile/tablet and hidden on lg+
  assert(
    mobileBottomNavContent.includes(`display: { xs: "block", lg: "none" }`),
    'MobileBottomNav must have display { xs: "block", lg: "none" }'
  );

  // 5. AppShell content margin-left must be 0 on mobile/tablet and sidebarWidth on lg+
  assert(
    appShellContent.includes(`ml: { xs: 0, lg: \`\${sidebarWidth}px\` }`),
    'AppShell content must have ml: { xs: 0, lg: `${sidebarWidth}px` }'
  );

  // 6. AppShell bottom padding must provide clearance for mobile bottom bar
  assert(
    appShellContent.includes(`pb: { xs: 10, lg: 4 }`),
    'AppShell must include pb: { xs: 10, lg: 4 } for bottom nav clearance'
  );

  // 7. DesktopSidebar width handling for collapsed (72px) vs expanded (256px)
  assert(
    desktopSidebarContent.includes('const sidebarWidth = collapsed ? 72 : 256;'),
    'DesktopSidebar must handle collapsed (72px) vs expanded (256px)'
  );
  assert(
    appShellContent.includes('const sidebarWidth = sidebarCollapsed ? 72 : 256;'),
    'AppShell must synchronize sidebarWidth calculation (72px vs 256px)'
  );
});

// ==========================================
// TEST 4: MobileBottomNav Structure & FAB
// ==========================================
runTest('Verify MobileBottomNav has 5 tab destinations and no add button', () => {
  const content = fs.readFileSync(
    path.join(ROOT_DIR, 'src/components/layout/MobileBottomNav.tsx'),
    'utf8'
  );

  for (const label of ['Overview', 'Finance', 'Tasks', 'Notes', 'Calendar']) {
    assert(content.includes(`label: "${label}"`), `MobileBottomNav missing ${label}`);
  }
  // Adding transactions is scoped to the Finance page, so the footer has no FAB
  assert(!content.includes('<Fab'), 'MobileBottomNav must not include a FAB');
});

// ==========================================
// TEST 5: TopHeader Editorial Elements
// ==========================================
runTest('Verify TopHeader editorial greeting, system status, search, and flyout', () => {
  const content = fs.readFileSync(
    path.join(ROOT_DIR, 'src/components/layout/TopHeader.tsx'),
    'utf8'
  );

  assert(content.includes('Good morning, Alex.'), 'TopHeader missing editorial greeting');
  assert(content.includes('System Steady'), 'TopHeader missing System Steady pill');
  assert(content.includes('⌘K'), 'TopHeader missing ⌘K keyboard shortcut badge');
  assert(content.includes('Add Entry'), 'TopHeader missing Add Entry button');
  assert(content.includes('Log Expense'), 'TopHeader missing Log Expense action');
  assert(content.includes('Log Income'), 'TopHeader missing Log Income action');
  assert(content.includes('Transfer Funds'), 'TopHeader missing Transfer Funds action');
  assert(content.includes('Add Focus Task'), 'TopHeader missing Add Focus Task action');
  assert(content.includes('New Journal Note'), 'TopHeader missing New Journal Note action');
  assert(content.includes('Set Target Goal'), 'TopHeader missing Set Target Goal action');
});

// ==========================================
// TEST 6: Font Variables in Layout & Globals
// ==========================================
runTest('Verify tri-font variables in layout.tsx, globals.css, and theme.ts', () => {
  const layoutContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src/app/layout.tsx'),
    'utf8'
  );
  const globalsContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src/app/globals.css'),
    'utf8'
  );
  const themeContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src/lib/mui/theme.ts'),
    'utf8'
  );

  // Layout font variables
  assert(layoutContent.includes('variable: "--font-newsreader"'), 'Missing --font-newsreader in layout.tsx');
  assert(layoutContent.includes('variable: "--font-plus-jakarta-sans"'), 'Missing --font-plus-jakarta-sans in layout.tsx');
  assert(layoutContent.includes('variable: "--font-jetbrains-mono"'), 'Missing --font-jetbrains-mono in layout.tsx');
  assert(
    layoutContent.includes('${newsreader.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}'),
    'Font variables must be bound to root html element in layout.tsx'
  );

  // Globals.css @theme definitions
  assert(globalsContent.includes('--font-serif: var(--font-newsreader)'), 'Missing --font-serif in globals.css');
  assert(globalsContent.includes('--font-sans: var(--font-plus-jakarta-sans)'), 'Missing --font-sans in globals.css');
  assert(globalsContent.includes('--font-mono: var(--font-jetbrains-mono)'), 'Missing --font-mono in globals.css');

  // Globals.css utilities
  assert(globalsContent.includes('.no-scrollbar'), 'Missing .no-scrollbar in globals.css');
  assert(globalsContent.includes('.font-tabular'), 'Missing .font-tabular in globals.css');
  assert(globalsContent.includes('font-variant-numeric: tabular-nums'), 'Missing tabular-nums in globals.css');

  // Theme.ts font mappings
  assert(themeContent.includes('var(--font-newsreader)'), 'MUI theme missing var(--font-newsreader)');
  assert(themeContent.includes('var(--font-plus-jakarta-sans)'), 'MUI theme missing var(--font-plus-jakarta-sans)');
});

// ==========================================
// TEST 7: MUI Component Priority Check
// ==========================================
runTest('Verify MUI component imports across layout components', () => {
  const layoutComponents = [
    'src/components/layout/AppShell.tsx',
    'src/components/layout/DesktopSidebar.tsx',
    'src/components/layout/TopHeader.tsx',
    'src/components/layout/MobileTopBar.tsx',
    'src/components/layout/MobileBottomNav.tsx',
    'src/components/layout/QuickEntryModal.tsx',
  ];

  for (const compPath of layoutComponents) {
    const content = fs.readFileSync(path.join(ROOT_DIR, compPath), 'utf8');
    assert(
      content.includes('@mui/material'),
      `Component ${compPath} must import from @mui/material`
    );
    assert(
      content.startsWith('"use client"') || content.startsWith("'use client'"),
      `Layout component ${compPath} must be a client component`
    );
  }
});

console.log(`\n--- ALL ${passedTests} / ${totalTests} TESTS PASSED EMPIRICALLY ---`);
