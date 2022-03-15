import { MediaInfo } from "@/interface";

const MEDIA_DATA_LS_KEY = "testLsKey";
export const saveMediaData = (data: MediaInfo[]): void => {
  const str = JSON.stringify(data) ?? "";
  localStorage.setItem(MEDIA_DATA_LS_KEY, str);
};

export const getMediaData = (): MediaInfo[] => {
  const str = localStorage.getItem(MEDIA_DATA_LS_KEY) ?? "[]";
  return (JSON.parse(str) ?? []) as MediaInfo[];
};

export const downloadCanvasImage = (cvs: HTMLCanvasElement): void => {
  const base64string = cvs.toDataURL();
  console.log(base64string);

  const blob = base64ToBlob(base64string);
  if (blob) {
    const dlURL = window.URL.createObjectURL(blob);
    window.open(dlURL, "_blank");
  } else {
    alert("画像の生成に失敗しました。開発者までお問い合わせください。 ");
  }
};

const base64ToBlob = (base64: string): Blob | null => {
  base64 = base64.replace("data:image/png;base64,", "");
  let blob;
  const bin = atob(base64.replace(/^.\*,/, ""));
  const buffer = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  // Blobを作成
  try {
    blob = new Blob([buffer.buffer], {
      type: "image/png",
    });
  } catch (e) {
    return null;
  }
  return blob;
};

export const isPC = (): boolean => {
  const ua = navigator.userAgent;
  if (
    ua.indexOf("iPhone") > -1 ||
    (ua.indexOf("Android") > -1 && ua.indexOf("Mobile") > -1)
  ) {
    // スマホ
    return false;
  } else if (ua.indexOf("iPad") > -1 || ua.indexOf("Android") > -1) {
    // タブレット
    return false;
  } else {
    // PC
    return true;
  }
};
