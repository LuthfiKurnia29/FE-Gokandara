import { NextRequest, NextResponse } from 'next/server';

import { PenjualanDB } from '@/lib/database/penjualan';
import { PenjualanStatus } from '@/types/penjualan';

// PATCH /api/penjualan/[id]/status - Update penjualan status only (Laravel style)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const existingPenjualan = PenjualanDB.getById(id);
    if (!existingPenjualan) {
      return NextResponse.json({ message: 'Penjualan not found.' }, { status: 404 });
    }

    // Validation for status field
    if (!body.status) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            status: ['The status field is required.']
          }
        },
        { status: 422 }
      );
    }

    // Validate status value
    if (!['Negotiation', 'Pending', 'Approved'].includes(body.status)) {
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

    // Update penjualan status only
    const updatedPenjualan = PenjualanDB.updateStatus(id, body.status as PenjualanStatus);

    if (!updatedPenjualan) {
      return NextResponse.json({ message: 'Failed to update penjualan status.' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Penjualan status updated successfully.',
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

// PUT /api/penjualan/[id]/status - Update penjualan status only (Laravel style) - alternative method
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const existingPenjualan = PenjualanDB.getById(id);
    if (!existingPenjualan) {
      return NextResponse.json({ message: 'Penjualan not found.' }, { status: 404 });
    }

    // Validation for status field
    if (!body.status) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            status: ['The status field is required.']
          }
        },
        { status: 422 }
      );
    }

    // Validate status value
    if (!['Negotiation', 'Pending', 'Approved'].includes(body.status)) {
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

    // Update penjualan status only
    const updatedPenjualan = PenjualanDB.updateStatus(id, body.status as PenjualanStatus);

    if (!updatedPenjualan) {
      return NextResponse.json({ message: 'Failed to update penjualan status.' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Penjualan status updated successfully.',
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
