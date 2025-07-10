import { NextRequest, NextResponse } from 'next/server';

import { PropertyDB } from '@/lib/database/property';
import { PropertyStatus } from '@/types/property';

// GET /api/property - Index with pagination and filters (Laravel style)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as PropertyStatus | undefined;
    const type = searchParams.get('type') || undefined;
    const location = searchParams.get('location') || undefined;
    const minPrice = searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined;
    const maxPrice = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined;

    // Get filtered data based on search and filters
    const filteredData = PropertyDB.getFiltered(search, status, type, location, minPrice, maxPrice);

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
      first_page_url: `${request.nextUrl.origin}/api/property?page=1`,
      from: data.length > 0 ? from : null,
      last_page: lastPage,
      last_page_url: `${request.nextUrl.origin}/api/property?page=${lastPage}`,
      links: [
        {
          url: page > 1 ? `${request.nextUrl.origin}/api/property?page=${page - 1}` : null,
          label: '&laquo; Previous',
          active: false
        },
        ...Array.from({ length: lastPage }, (_, i) => ({
          url: `${request.nextUrl.origin}/api/property?page=${i + 1}`,
          label: (i + 1).toString(),
          active: i + 1 === page
        })),
        {
          url: page < lastPage ? `${request.nextUrl.origin}/api/property?page=${page + 1}` : null,
          label: 'Next &raquo;',
          active: false
        }
      ],
      next_page_url: page < lastPage ? `${request.nextUrl.origin}/api/property?page=${page + 1}` : null,
      path: `${request.nextUrl.origin}/api/property`,
      per_page: perPage,
      prev_page_url: page > 1 ? `${request.nextUrl.origin}/api/property?page=${page - 1}` : null,
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

// POST /api/property - Store new property (Laravel style)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation (Laravel style)
    const requiredFields = ['code', 'name', 'location', 'address', 'price', 'type', 'bedrooms', 'bathrooms', 'area'];
    const missingFields = requiredFields.filter((field) => !body[field] && body[field] !== 0);

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

    // Validate status if provided
    if (body.status && !['available', 'sold', 'pending', 'reserved'].includes(body.status)) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            status: ['The status field must be one of: available, sold, pending, reserved.']
          }
        },
        { status: 422 }
      );
    }

    // Check if code already exists
    if (PropertyDB.codeExists(body.code)) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            code: ['The code has already been taken.']
          }
        },
        { status: 422 }
      );
    }

    // Validate numeric fields
    const numericFields = ['price', 'discountPrice', 'bedrooms', 'bathrooms', 'area'];
    const numericErrors: Record<string, string[]> = {};

    numericFields.forEach((field) => {
      if (body[field] !== undefined && isNaN(Number(body[field]))) {
        numericErrors[field] = [`The ${field} field must be a number.`];
      }
    });

    if (Object.keys(numericErrors).length > 0) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: numericErrors
        },
        { status: 422 }
      );
    }

    // Validate arrays
    if (body.facilities && !Array.isArray(body.facilities)) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            facilities: ['The facilities field must be an array.']
          }
        },
        { status: 422 }
      );
    }

    if (body.images && !Array.isArray(body.images)) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            images: ['The images field must be an array.']
          }
        },
        { status: 422 }
      );
    }

    // Create new property
    const newProperty = PropertyDB.create({
      code: body.code,
      name: body.name,
      description: body.description || '',
      location: body.location,
      address: body.address,
      price: Number(body.price),
      discountPrice: body.discountPrice ? Number(body.discountPrice) : undefined,
      status: body.status || 'available',
      type: body.type,
      bedrooms: Number(body.bedrooms),
      bathrooms: Number(body.bathrooms),
      area: Number(body.area),
      facilities: body.facilities || [],
      images: body.images || [],
      hasWifi: Boolean(body.hasWifi)
    });

    // Laravel-style success response
    return NextResponse.json(
      {
        message: 'Property created successfully.',
        data: newProperty
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
