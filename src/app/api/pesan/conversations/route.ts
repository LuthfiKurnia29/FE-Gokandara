import { NextRequest, NextResponse } from 'next/server';

import { ChatConversationDB } from '@/lib/database/pesan';

// GET /api/pesan/conversations - Index with pagination (Laravel style)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    const search = searchParams.get('search') || '';
    const participantId = searchParams.get('participant_id')
      ? parseInt(searchParams.get('participant_id')!)
      : undefined;

    // Get filtered data based on search and filters
    const filteredData = ChatConversationDB.getFiltered(search, participantId);

    // Calculate pagination
    const total = filteredData.length;
    const lastPage = Math.ceil(total / perPage);
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    // Get paginated data
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const data = filteredData.slice(startIndex, endIndex);

    // Laravel-style response
    const response = {
      current_page: page,
      data: data,
      first_page_url: `${request.nextUrl.origin}/api/pesan/conversations?page=1`,
      from: data.length > 0 ? from : null,
      last_page: lastPage,
      last_page_url: `${request.nextUrl.origin}/api/pesan/conversations?page=${lastPage}`,
      links: [
        {
          url: page > 1 ? `${request.nextUrl.origin}/api/pesan/conversations?page=${page - 1}` : null,
          label: '&laquo; Previous',
          active: false
        },
        ...Array.from({ length: lastPage }, (_, i) => ({
          url: `${request.nextUrl.origin}/api/pesan/conversations?page=${i + 1}`,
          label: (i + 1).toString(),
          active: i + 1 === page
        })),
        {
          url: page < lastPage ? `${request.nextUrl.origin}/api/pesan/conversations?page=${page + 1}` : null,
          label: 'Next &raquo;',
          active: false
        }
      ],
      next_page_url: page < lastPage ? `${request.nextUrl.origin}/api/pesan/conversations?page=${page + 1}` : null,
      path: `${request.nextUrl.origin}/api/pesan/conversations`,
      per_page: perPage,
      prev_page_url: page > 1 ? `${request.nextUrl.origin}/api/pesan/conversations?page=${page - 1}` : null,
      to: data.length > 0 ? to : null,
      total: total
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
