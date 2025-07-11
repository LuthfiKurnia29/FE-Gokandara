import { NextRequest, NextResponse } from 'next/server';

import { PesanDB } from '@/lib/database/pesan';
import { CreatePesanData } from '@/types/pesan';

// GET /api/pesan - Index with pagination (Laravel style)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    const search = searchParams.get('search') || '';
    const senderId = searchParams.get('sender_id') ? parseInt(searchParams.get('sender_id')!) : undefined;
    const receiverId = searchParams.get('receiver_id') ? parseInt(searchParams.get('receiver_id')!) : undefined;

    // Get filtered data based on search and filters
    const filteredData = PesanDB.getFiltered(search, senderId, receiverId);

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
      first_page_url: `${request.nextUrl.origin}/api/pesan?page=1`,
      from: data.length > 0 ? from : null,
      last_page: lastPage,
      last_page_url: `${request.nextUrl.origin}/api/pesan?page=${lastPage}`,
      links: [
        {
          url: page > 1 ? `${request.nextUrl.origin}/api/pesan?page=${page - 1}` : null,
          label: '&laquo; Previous',
          active: false
        },
        ...Array.from({ length: lastPage }, (_, i) => ({
          url: `${request.nextUrl.origin}/api/pesan?page=${i + 1}`,
          label: (i + 1).toString(),
          active: i + 1 === page
        })),
        {
          url: page < lastPage ? `${request.nextUrl.origin}/api/pesan?page=${page + 1}` : null,
          label: 'Next &raquo;',
          active: false
        }
      ],
      next_page_url: page < lastPage ? `${request.nextUrl.origin}/api/pesan?page=${page + 1}` : null,
      path: `${request.nextUrl.origin}/api/pesan`,
      per_page: perPage,
      prev_page_url: page > 1 ? `${request.nextUrl.origin}/api/pesan?page=${page - 1}` : null,
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

// POST /api/pesan - Store new message (Laravel style)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation (Laravel style)
    const requiredFields = ['receiver_id', 'message'];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: missingFields.reduce(
            (acc, field) => {
              acc[field] = [`The ${field} field is required.`];
              return acc;
            },
            {} as Record<string, string[]>
          )
        },
        { status: 422 }
      );
    }

    // Additional validation
    if (!body.sender_id) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            sender_id: ['The sender_id field is required.']
          }
        },
        { status: 422 }
      );
    }

    if (body.sender_id === body.receiver_id) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            receiver_id: ['Cannot send message to yourself.']
          }
        },
        { status: 422 }
      );
    }

    // Create new message
    const createData: CreatePesanData & { sender_id: number } = {
      sender_id: body.sender_id,
      receiver_id: body.receiver_id,
      message: body.message,
      message_type: body.message_type || 'text'
    };

    try {
      const newMessage = PesanDB.create(createData);

      // Laravel-style success response
      return NextResponse.json(
        {
          message: 'Message sent successfully.',
          data: newMessage
        },
        { status: 201 }
      );
    } catch (dbError) {
      return NextResponse.json(
        {
          message: 'Failed to send message.',
          error: dbError instanceof Error ? dbError.message : 'Database error'
        },
        { status: 400 }
      );
    }
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
