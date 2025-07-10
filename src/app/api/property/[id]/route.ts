import { NextRequest, NextResponse } from 'next/server';

import { PropertyDB } from '@/lib/database/property';
import { PropertyData } from '@/types/property';

// GET /api/property/[id] - Show specific property (Laravel style)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const property = PropertyDB.getById(id);

    if (!property) {
      return NextResponse.json({ message: 'Property not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Property retrieved successfully.',
      data: property
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

// PUT /api/property/[id] - Update property (Laravel style)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const existingProperty = PropertyDB.getById(id);
    if (!existingProperty) {
      return NextResponse.json({ message: 'Property not found.' }, { status: 404 });
    }

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

    // Check if code already exists (excluding current property)
    if (PropertyDB.codeExists(body.code, id)) {
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

    // Update property
    const updatedProperty = PropertyDB.update(id, {
      code: body.code,
      name: body.name,
      description: body.description || existingProperty.description,
      location: body.location,
      address: body.address,
      price: Number(body.price),
      discountPrice: body.discountPrice ? Number(body.discountPrice) : existingProperty.discountPrice,
      status: body.status || existingProperty.status,
      type: body.type,
      bedrooms: Number(body.bedrooms),
      bathrooms: Number(body.bathrooms),
      area: Number(body.area),
      facilities: body.facilities || existingProperty.facilities,
      images: body.images || existingProperty.images,
      hasWifi: body.hasWifi !== undefined ? Boolean(body.hasWifi) : existingProperty.hasWifi
    });

    return NextResponse.json({
      message: 'Property updated successfully.',
      data: updatedProperty
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

// PATCH /api/property/[id] - Partial update property (Laravel style)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const existingProperty = PropertyDB.getById(id);
    if (!existingProperty) {
      return NextResponse.json({ message: 'Property not found.' }, { status: 404 });
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

    // Check if code already exists (excluding current property) if code is being updated
    if (body.code && PropertyDB.codeExists(body.code, id)) {
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

    // Validate numeric fields if provided
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

    // Validate arrays if provided
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

    // Prepare update data (only include provided fields)
    const updateData: Partial<Omit<PropertyData, 'id' | 'createdAt'>> = {};
    if (body.code !== undefined) updateData.code = body.code;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.discountPrice !== undefined)
      updateData.discountPrice = body.discountPrice ? Number(body.discountPrice) : undefined;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.bedrooms !== undefined) updateData.bedrooms = Number(body.bedrooms);
    if (body.bathrooms !== undefined) updateData.bathrooms = Number(body.bathrooms);
    if (body.area !== undefined) updateData.area = Number(body.area);
    if (body.facilities !== undefined) updateData.facilities = body.facilities;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.hasWifi !== undefined) updateData.hasWifi = Boolean(body.hasWifi);

    // Partial update property
    const updatedProperty = PropertyDB.update(id, updateData);

    return NextResponse.json({
      message: 'Property updated successfully.',
      data: updatedProperty
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

// DELETE /api/property/[id] - Delete property (Laravel style)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const deletedProperty = PropertyDB.delete(id);

    if (!deletedProperty) {
      return NextResponse.json({ message: 'Property not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Property deleted successfully.',
      data: deletedProperty
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
