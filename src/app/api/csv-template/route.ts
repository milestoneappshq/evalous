import { NextResponse } from 'next/server';

export async function GET() {
  const csvContent = `Email,Name
john.doe@example.com,John Doe
jane.smith@example.com,Jane Smith
demo.candidate@test.com,Demo Candidate`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="candidate_template.csv"',
    },
  });
}
