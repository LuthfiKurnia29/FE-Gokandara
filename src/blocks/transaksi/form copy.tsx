import React, { useState } from 'react';

import { Check, Home, X } from 'lucide-react';

const PropertyTypeModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedType, setSelectedType] = useState('Tipe 12');

  const propertyTypes = [
    {
      id: 'tipe12',
      name: 'Tipe 12',
      features: ['Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet'],
      selected: true
    },
    {
      id: 'tipe16',
      name: 'Tipe 16',
      features: ['Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet'],
      selected: false
    }
  ];

  const handleTypeSelect = (typeName: string) => {
    setSelectedType(typeName);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleChoose = () => {
    console.log('Selected type:', selectedType);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-100'>
        <button
          onClick={() => setIsOpen(true)}
          className='rounded-lg bg-teal-600 px-6 py-3 text-white hover:bg-teal-700'>
          Open Property Type Modal
        </button>
      </div>
    );
  }

  return (
    <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4'>
      <div className='max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='relative p-8 pb-6'>
          <button
            onClick={handleClose}
            className='absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'>
            <X className='h-4 w-4 text-gray-500' />
          </button>

          <div className='text-center'>
            <h2 className='mb-3 text-3xl font-bold text-gray-900'>Lorem Ipsum</h2>
            <p className='text-lg text-gray-600'>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
          </div>
        </div>

        {/* Property Type Cards */}
        <div className='px-8 pb-8'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {propertyTypes.map((type) => (
              <div
                key={type.id}
                className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${
                  selectedType === type.name
                    ? 'border-teal-500 bg-teal-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => handleTypeSelect(type.name)}>
                {/* House Icon */}
                <div className='mb-6 flex justify-center'>
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-lg ${
                      selectedType === type.name ? 'bg-teal-600' : 'bg-teal-600'
                    }`}>
                    <Home className='h-8 w-8 text-white' />
                  </div>
                </div>

                {/* Type Name */}
                <h3 className='mb-8 text-center text-2xl font-bold text-teal-700'>{type.name}</h3>

                {/* Features */}
                <div className='mb-8 space-y-4'>
                  {type.features.map((feature, index) => (
                    <div key={index} className='flex items-center gap-3'>
                      <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100'>
                        <Check className='h-3 w-3 text-green-600' />
                      </div>
                      <span className='text-gray-600'>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  className={`w-full rounded-xl py-4 font-semibold transition-all duration-300 ${
                    selectedType === type.name
                      ? 'bg-green-500 text-white shadow-lg hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 hover:bg-gray-400'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTypeSelect(type.name);
                  }}>
                  Pilih
                </button>

                {/* Selection Indicator */}
                {selectedType === type.name && (
                  <div className='absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500'>
                    <Check className='h-4 w-4 text-white' />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Action Button */}
          <div className='mt-8 flex justify-center'>
            <button
              onClick={handleChoose}
              className='rounded-xl bg-teal-600 px-12 py-4 font-semibold text-white shadow-lg transition-colors hover:bg-teal-700'>
              Pilih {selectedType}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyTypeModal;
