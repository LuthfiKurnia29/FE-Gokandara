'use client';

import { PropertyData } from '@/types/properti';

interface PropertyDescriptionProps {
  property?: PropertyData;
}

export const PropertyDescription = ({ property }: PropertyDescriptionProps) => {
  return (
    <section className='mb-8'>
      <h2 className='mb-4 text-2xl font-bold text-gray-800'>Deskripsi</h2>
      <div className='space-y-4 text-sm leading-relaxed text-gray-600'>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus non laoreet tortor. Curabitur varius arcu ex,
          non blandit lorem dignissim eu. Mauris sed varius purus. Mauris feugiat elementum sapien non volutpat.
        </p>
        <p>
          Nulla molestiae lorem sapien, at sollicitudin erat ultricies non. Integer sollicitudin, quam eget fermentum
          pharetra, risus metus accumsan ante, a efficitur metus elit ut nunc. Suspendisse at augue vel justo vehicula
          varius. Sed non odio ultrices et lobortis nec metus vitae magna. Maecenas at eros eget orci efficitur
          sollicitudin. Phasellus quis nisl quam. Nam vitae fringilla nulla. Vestibulum hendrerit, urna vel venenatis
          volutpat, purus risus feugiat magna, quis varius tellus dui et neque. Nunc eget mauris mi. Donec eget lorem id
          tellus auctor molestie. Aliquam at tristique magna. Sed tempus nisl et mollis luctus. Curabitur porta risus
          eget sapien consequat venenatis. Vivamus gravida convallis iaculis.
        </p>
      </div>
    </section>
  );
};
