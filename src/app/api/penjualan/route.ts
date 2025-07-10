import { NextRequest, NextResponse } from 'next/server';

import { KonsumenDB } from '@/lib/database/konsumen';
import { PenjualanDB } from '@/lib/database/penjualan';
import { PropertyDB } from '@/lib/database/property';
import { PenjualanStatus, PenjualanWithRelations } from '@/types/penjualan';

// GET /api/penjualan - Index with pagination and filters (Laravel style)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as PenjualanStatus | undefined;
    const konsumenId = searchParams.get('konsumen_id') ? parseInt(searchParams.get('konsumen_id')!) : undefined;
    const include = searchParams.get('include') || '';

    // Parse include relations
    const includeRelations = include
      .split(',')
      .map((rel) => rel.trim())
      .filter(Boolean);
    const includeKonsumen = includeRelations.includes('konsumen');
    const includeProperty = includeRelations.includes('property');

    // Get filtered data based on search, status, and konsumenId
    const filteredData = PenjualanDB.getFiltered(search, status, konsumenId);

    // Calculate pagination
    const total = filteredData.length;
    const lastPage = Math.ceil(total / perPage);
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    // Get paginated data
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Add relations if requested
    const data: PenjualanWithRelations[] = paginatedData.map((penjualan) => {
      const enrichedPenjualan: PenjualanWithRelations = { ...penjualan };

      if (includeKonsumen) {
        enrichedPenjualan.konsumen = KonsumenDB.getById(penjualan.konsumenId);
      }

      if (includeProperty) {
        enrichedPenjualan.property = PropertyDB.getById(penjualan.propertiId);
      }

      return enrichedPenjualan;
    });

    // Laravel-style response
    const response = {
      current_page: page,
      data: data,
      first_page_url: `${request.nextUrl.origin}/api/penjualan?page=1`,
      from: data.length > 0 ? from : null,
      last_page: lastPage,
      last_page_url: `${request.nextUrl.origin}/api/penjualan?page=${lastPage}`,
      links: [
        {
          url: page > 1 ? `${request.nextUrl.origin}/api/penjualan?page=${page - 1}` : null,
          label: '&laquo; Previous',
          active: false
        },
        ...Array.from({ length: lastPage }, (_, i) => ({
          url: `${request.nextUrl.origin}/api/penjualan?page=${i + 1}`,
          label: (i + 1).toString(),
          active: i + 1 === page
        })),
        {
          url: page < lastPage ? `${request.nextUrl.origin}/api/penjualan?page=${page + 1}` : null,
          label: 'Next &raquo;',
          active: false
        }
      ],
      next_page_url: page < lastPage ? `${request.nextUrl.origin}/api/penjualan?page=${page + 1}` : null,
      path: `${request.nextUrl.origin}/api/penjualan`,
      per_page: perPage,
      prev_page_url: page > 1 ? `${request.nextUrl.origin}/api/penjualan?page=${page - 1}` : null,
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

// POST /api/penjualan - Handle both pagination/listing and creation (Laravel style)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a pagination request (has pagination fields)
    const isPaginationRequest =
      body.hasOwnProperty('page') || body.hasOwnProperty('per') || body.hasOwnProperty('search');

    if (isPaginationRequest) {
      // Handle pagination request
      const page = parseInt(body.page || '1');
      const perPage = parseInt(body.per || '10');
      const search = body.search || '';
      const status = body.status as PenjualanStatus | undefined;
      const konsumenId = body.konsumen_id ? parseInt(body.konsumen_id) : undefined;
      const include = body.include || '';

      // Parse include relations
      const includeRelations = include
        .split(',')
        .map((rel: string) => rel.trim())
        .filter(Boolean);
      const includeKonsumen = includeRelations.includes('konsumen');
      const includeProperty = includeRelations.includes('property');

      // Get filtered data based on search, status, and konsumenId
      const filteredData = PenjualanDB.getFiltered(search, status, konsumenId);

      // Calculate pagination
      const total = filteredData.length;
      const lastPage = Math.ceil(total / perPage);
      const from = (page - 1) * perPage + 1;
      const to = Math.min(page * perPage, total);

      // Get paginated data
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      // Add relations if requested
      const data: PenjualanWithRelations[] = paginatedData.map((penjualan) => {
        const enrichedPenjualan: PenjualanWithRelations = { ...penjualan };

        if (includeKonsumen) {
          enrichedPenjualan.konsumen = KonsumenDB.getById(penjualan.konsumenId);
        }

        if (includeProperty) {
          enrichedPenjualan.property = PropertyDB.getById(penjualan.propertiId);
        }

        return enrichedPenjualan;
      });

      // Laravel-style response
      const response = {
        current_page: page,
        data: data,
        first_page_url: `${request.nextUrl.origin}/api/penjualan?page=1`,
        from: data.length > 0 ? from : null,
        last_page: lastPage,
        last_page_url: `${request.nextUrl.origin}/api/penjualan?page=${lastPage}`,
        links: [
          {
            url: page > 1 ? `${request.nextUrl.origin}/api/penjualan?page=${page - 1}` : null,
            label: '&laquo; Previous',
            active: false
          },
          ...Array.from({ length: lastPage }, (_, i) => ({
            url: `${request.nextUrl.origin}/api/penjualan?page=${i + 1}`,
            label: (i + 1).toString(),
            active: i + 1 === page
          })),
          {
            url: page < lastPage ? `${request.nextUrl.origin}/api/penjualan?page=${page + 1}` : null,
            label: 'Next &raquo;',
            active: false
          }
        ],
        next_page_url: page < lastPage ? `${request.nextUrl.origin}/api/penjualan?page=${page + 1}` : null,
        path: `${request.nextUrl.origin}/api/penjualan`,
        per_page: perPage,
        prev_page_url: page > 1 ? `${request.nextUrl.origin}/api/penjualan?page=${page - 1}` : null,
        to: data.length > 0 ? to : null,
        total: total
      };

      return NextResponse.json(response);
    }

    // Handle creation request
    // Validation (Laravel style)
    const requiredFields = ['konsumenId', 'propertiId', 'grandTotal'];
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
    if (body.status && !['Negotiation', 'Pending', 'Approved'].includes(body.status)) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            status: ['The status field must be one of: Negotiation, Pending, Approved.']
          }
        },
        { status: 422 }
      );
    }

    // Validate numeric fields
    if (isNaN(Number(body.konsumenId)) || isNaN(Number(body.propertiId)) || isNaN(Number(body.grandTotal))) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            konsumenId: isNaN(Number(body.konsumenId)) ? ['The konsumenId field must be a number.'] : undefined,
            propertiId: isNaN(Number(body.propertiId)) ? ['The propertiId field must be a number.'] : undefined,
            grandTotal: isNaN(Number(body.grandTotal)) ? ['The grandTotal field must be a number.'] : undefined
          }
        },
        { status: 422 }
      );
    }

    if (body.diskon !== undefined && isNaN(Number(body.diskon))) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            diskon: ['The diskon field must be a number.']
          }
        },
        { status: 422 }
      );
    }

    // Create new penjualan
    const newPenjualan = PenjualanDB.create({
      konsumenId: Number(body.konsumenId),
      propertiId: Number(body.propertiId),
      diskon: Number(body.diskon) || 0,
      grandTotal: Number(body.grandTotal),
      status: body.status || 'Negotiation'
    });

    // Laravel-style success response
    return NextResponse.json(
      {
        message: 'Penjualan created successfully.',
        data: newPenjualan
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
