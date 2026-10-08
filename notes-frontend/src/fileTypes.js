export const ACCEPTED_NOTE_FILE_TYPES =
  ".pdf,.ppt,.pptx";
export const MAX_NOTE_FILE_SIZE = 15 * 1024 * 1024;

const allowedExtensions = new Set([".pdf", ".ppt", ".pptx"]);

export function isSupportedNoteFile(file) {
  const extension = file?.name?.slice(file.name.lastIndexOf(".")).toLowerCase();
  return allowedExtensions.has(extension);
}
