import React, { memo, useEffect, useState } from 'react';

import { ActualFileObject, FilePondFile } from 'filepond';
import FilePondPluginFilePoster from 'filepond-plugin-file-poster';
import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';
import { FilePond, FilePondProps, registerPlugin } from 'react-filepond';

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster,
  FilePondPluginFileValidateType
);

interface FileUploadProps extends Omit<FilePondProps, 'onupdatefiles'> {
  onChange?: (file: FilePondFile[] | null) => void;
  initialFiles?: (string | Blob)[];
  onupdatefiles?: (file: FilePondFile[] | null) => void;
}

const FileUpload = memo<FileUploadProps>(({ onChange, initialFiles, onupdatefiles, ...filePondProps }) => {
  const [files, setFiles] = useState<(string | Blob)[] | undefined>(initialFiles);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  return (
    <FilePond
      {...filePondProps}
      files={files}
      onupdatefiles={(filePondFiles: FilePondFile[]) => {
        // Convert FilePondFile[] to the format we need for state
        const fileArray = filePondFiles.map((filePondFile) => filePondFile.file);
        setFiles(fileArray);

        // Get the actual File object from the first FilePondFile
        // const firstFile = filePondFiles.length > 0 ? filePondFiles[0].file : null;

        if (onupdatefiles) {
          onupdatefiles(filePondFiles);
        }
        if (onChange) {
          onChange(filePondFiles);
        }
      }}
    />
  );
});

export { FileUpload };
