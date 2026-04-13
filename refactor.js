const fs = require('fs');
const path = require('path');

const files = [
  'prisma/seed.ts',
  'src/auth.ts',
  'src/actions/dashboard.ts',
  'src/actions/saveCustomTest.ts',
  'src/actions/saveTest.ts',
  'src/actions/submitCustomTest.ts',
  'src/actions/getTests.ts',
  'src/actions/bulkUpload.ts',
  'src/app/dashboard/page.tsx',
  'src/app/test/[slug]/page.tsx'
];

for (const p of files) {
  const fullPath = path.join(process.cwd(), p);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace instantiation
    content = content.replace(/const prisma = new PrismaClient\(.*?\);?/g, '');
    
    // Replace imports
    if (content.includes('import { PrismaClient }')) {
      if (content.match(/import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"]/)) {
        content = content.replace(/import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"];?/, "import { prisma } from '@/lib/prisma';");
      } else {
        content = content.replace(/PrismaClient\s*,\s*/, '');
        content = content.replace(/,\s*PrismaClient/, '');
        content = content.replace(/(import\s*{[^}]+}\s*from\s*['"]@prisma\/client['"];?)/, "$1\nimport { prisma } from '@/lib/prisma';");
      }
    }
    
    if (p === 'prisma/seed.ts') {
        content = content.replace(/@\/lib\/prisma/g, '../src/lib/prisma');
    }
    
    fs.writeFileSync(fullPath, content);
    console.log('Processed', p);
  }
}
