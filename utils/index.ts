export function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      resolve(e.target!.result as string);
    };
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}
