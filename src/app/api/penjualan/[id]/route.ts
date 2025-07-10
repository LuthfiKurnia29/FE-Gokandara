import { NextRequest, NextResponse } from 'next/server';

import { KonsumenDB } from '@/lib/database/konsumen';
import { PenjualanDB } from '@/lib/database/penjualan';
import { PropertyDB } from '@/lib/database/property';
import { PenjualanData, PenjualanWithRelations } from '@/types/penjualan';

// GET /api/penjualan/[id] - Show specific penjualan (Laravel style)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const penjualan = PenjualanDB.getById(id);

    if (!penjualan) {
      return NextResponse.json({ message: 'Penjualan not found.' }, { status: 404 });
    }

    // Check for include relations
    const include = request.nextUrl.searchParams.get('include') || '';
    const includeRelations = include
      .split(',')
      .map((rel) => rel.trim())
      .filter(Boolean);
    const includeKonsumen = includeRelations.includes('konsumen');
    const includeProperty = includeRelations.includes('property');

    // Add relations if requested
    const enrichedPenjualan: PenjualanWithRelations = { ...penjualan };

    if (includeKonsumen) {
      enrichedPenjualan.konsumen = KonsumenDB.getById(penjualan.konsumenId);
    }

    if (includeProperty) {
      enrichedPenjualan.property = PropertyDB.getById(penjualan.propertiId);
    }

    return NextResponse.json({
      message: 'Penjualan retrieved successfully.',
      data: enrichedPenjualan
    });
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

// PUT /api/penjualan/[id] - Update penjualan (Laravel style)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const existingPenjualan = PenjualanDB.getById(id);
    if (!existingPenjualan) {
      return NextResponse.json({ message: 'Penjualan not found.' }, { status: 404 });
    }

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

    // Update penjualan
    const updatedPenjualan = PenjualanDB.update(id, {
      konsumenId: Number(body.konsumenId),
      propertiId: Number(body.propertiId),
      diskon: Number(body.diskon) || existingPenjualan.diskon,
      grandTotal: Number(body.grandTotal),
      status: body.status || existingPenjualan.status
    });

    return NextResponse.json({
      message: 'Penjualan updated successfully.',
      data: updatedPenjualan
    });
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

// PATCH /api/penjualan/[id] - Partial update penjualan (Laravel style)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const existingPenjualan = PenjualanDB.getById(id);
    if (!existingPenjualan) {
      return NextResponse.json({ message: 'Penjualan not found.' }, { status: 404 });
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

    // Validate numeric fields if provided
    const errors: Record<string, string[]> = {};
    if (body.konsumenId !== undefined && isNaN(Number(body.konsumenId))) {
      errors.konsumenId = ['The konsumenId field must be a number.'];
    }
    if (body.propertiId !== undefined && isNaN(Number(body.propertiId))) {
      errors.propertiId = ['The propertiId field must be a number.'];
    }
    if (body.diskon !== undefined && isNaN(Number(body.diskon))) {
      errors.diskon = ['The diskon field must be a number.'];
    }
    if (body.grandTotal !== undefined && isNaN(Number(body.grandTotal))) {
      errors.grandTotal = ['The grandTotal field must be a number.'];
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors
        },
        { status: 422 }
      );
    }

    // Prepare update data (only include provided fields)
    const updateData: Partial<Omit<PenjualanData, 'id' | 'createdAt'>> = {};
    if (body.konsumenId !== undefined) updateData.konsumenId = Number(body.konsumenId);
    if (body.propertiId !== undefined) updateData.propertiId = Number(body.propertiId);
    if (body.diskon !== undefined) updateData.diskon = Number(body.diskon);
    if (body.grandTotal !== undefined) updateData.grandTotal = Number(body.grandTotal);
    if (body.status !== undefined) updateData.status = body.status;

    // Partial update penjualan
    const updatedPenjualan = PenjualanDB.update(id, updateData);

    return NextResponse.json({
      message: 'Penjualan updated successfully.',
      data: updatedPenjualan
    });
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

// DELETE /api/penjualan/[id] - Delete penjualan (Laravel style)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const deletedPenjualan = PenjualanDB.delete(id);

    if (!deletedPenjualan) {
      return NextResponse.json({ message: 'Penjualan not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Penjualan deleted successfully.',
      data: deletedPenjualan
    });
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
