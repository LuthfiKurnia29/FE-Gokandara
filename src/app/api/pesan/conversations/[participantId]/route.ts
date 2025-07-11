import { NextRequest, NextResponse } from 'next/server';

import { PesanDB } from '@/lib/database/pesan';

// GET /api/pesan/conversations/[participantId] - Get messages between current user and specific participant
export async function GET(request: NextRequest, { params }: { params: { participantId: string } }) {
  try {
    const participantId = parseInt(params.participantId);
    const searchParams = request.nextUrl.searchParams;
    const currentUserId = searchParams.get('current_user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '50');

    if (isNaN(participantId)) {
      return NextResponse.json(
        {
          message: 'Invalid participant ID format',
          error: 'Participant ID must be a number'
        },
        { status: 400 }
      );
    }

    if (!currentUserId) {
      return NextResponse.json(
        {
          message: 'Current user ID is required',
          error: 'Please provide current_user_id as query parameter'
        },
        { status: 400 }
      );
    }

    const currentUserIdNum = parseInt(currentUserId);
    if (isNaN(currentUserIdNum)) {
      return NextResponse.json(
        {
          message: 'Invalid current user ID format',
          error: 'Current user ID must be a number'
        },
        { status: 400 }
      );
    }

    // Get conversation messages between two participants
    const conversationMessages = PesanDB.getConversationBetween(currentUserIdNum, participantId);

    // Calculate pagination
    const total = conversationMessages.length;
    const lastPage = Math.ceil(total / perPage);
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    // Get paginated data
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const data = conversationMessages.slice(startIndex, endIndex);

    // Laravel-style response
    const response = {
      current_page: page,
      data: data,
      first_page_url: `${request.nextUrl.origin}/api/pesan/conversations/${participantId}?page=1&current_user_id=${currentUserId}`,
      from: data.length > 0 ? from : null,
      last_page: lastPage,
      last_page_url: `${request.nextUrl.origin}/api/pesan/conversations/${participantId}?page=${lastPage}&current_user_id=${currentUserId}`,
      links: [
        {
          url:
            page > 1
              ? `${request.nextUrl.origin}/api/pesan/conversations/${participantId}?page=${page - 1}&current_user_id=${currentUserId}`
              : null,
          label: '&laquo; Previous',
          active: false
        },
        ...Array.from({ length: lastPage }, (_, i) => ({
          url: `${request.nextUrl.origin}/api/pesan/conversations/${participantId}?page=${i + 1}&current_user_id=${currentUserId}`,
          label: (i + 1).toString(),
          active: i + 1 === page
        })),
        {
          url:
            page < lastPage
              ? `${request.nextUrl.origin}/api/pesan/conversations/${participantId}?page=${page + 1}&current_user_id=${currentUserId}`
              : null,
          label: 'Next &raquo;',
          active: false
        }
      ],
      next_page_url:
        page < lastPage
          ? `${request.nextUrl.origin}/api/pesan/conversations/${participantId}?page=${page + 1}&current_user_id=${currentUserId}`
          : null,
      path: `${request.nextUrl.origin}/api/pesan/conversations/${participantId}`,
      per_page: perPage,
      prev_page_url:
        page > 1
          ? `${request.nextUrl.origin}/api/pesan/conversations/${participantId}?page=${page - 1}&current_user_id=${currentUserId}`
          : null,
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
