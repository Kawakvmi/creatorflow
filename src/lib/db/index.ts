import { get, set, del } from "idb-keyval";

export async function saveImage(id: string, base64: string): Promise<void> {
  try {
    await set(id, base64);
  } catch (error) {
    console.error("Failed to save image to IndexedDB:", error);
  }
}

export async function getImage(id: string): Promise<string | undefined> {
  try {
    return await get(id);
  } catch (error) {
    console.error("Failed to get image from IndexedDB:", error);
    return undefined;
  }
}

export async function deleteImage(id: string): Promise<void> {
  try {
    await del(id);
  } catch (error) {
    console.error("Failed to delete image from IndexedDB:", error);
  }
}
