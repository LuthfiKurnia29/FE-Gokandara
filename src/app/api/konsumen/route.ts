import { NextRequest, NextResponse } from 'next/server';

import { KonsumenDB } from '@/lib/database/konsumen';
import { KonsumenData } from '@/types/konsumen';

// GET /api/konsumen - Index with pagination (Laravel style)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    const search = searchParams.get('search') || '';

    // Get filtered data based on search
    const filteredData = KonsumenDB.getFiltered(search);

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
      first_page_url: `${request.nextUrl.origin}/api/konsumen?page=1`,
      from: data.length > 0 ? from : null,
      last_page: lastPage,
      last_page_url: `${request.nextUrl.origin}/api/konsumen?page=${lastPage}`,
      links: [
        {
          url: page > 1 ? `${request.nextUrl.origin}/api/konsumen?page=${page - 1}` : null,
          label: '&laquo; Previous',
          active: false
        },
        ...Array.from({ length: lastPage }, (_, i) => ({
          url: `${request.nextUrl.origin}/api/konsumen?page=${i + 1}`,
          label: (i + 1).toString(),
          active: i + 1 === page
        })),
        {
          url: page < lastPage ? `${request.nextUrl.origin}/api/konsumen?page=${page + 1}` : null,
          label: 'Next &raquo;',
          active: false
        }
      ],
      next_page_url: page < lastPage ? `${request.nextUrl.origin}/api/konsumen?page=${page + 1}` : null,
      path: `${request.nextUrl.origin}/api/konsumen`,
      per_page: perPage,
      prev_page_url: page > 1 ? `${request.nextUrl.origin}/api/konsumen?page=${page - 1}` : null,
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

// POST /api/konsumen - Store new konsumen (Laravel style)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation (Laravel style)
    const requiredFields = ['name', 'phone', 'email', 'address'];
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

    // Check if email already exists
    if (KonsumenDB.emailExists(body.email)) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            email: ['The email has already been taken.']
          }
        },
        { status: 422 }
      );
    }

    // Create new konsumen
    const newKonsumen = KonsumenDB.create({
      name: body.name,
      description: body.description || '',
      phone: body.phone,
      email: body.email,
      address: body.address
    });

    // Laravel-style success response
    return NextResponse.json(
      {
        message: 'Konsumen created successfully.',
        data: newKonsumen
      },
      { status: 201 }
    );
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
