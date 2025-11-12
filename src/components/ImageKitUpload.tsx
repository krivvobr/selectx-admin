import { Upload } from "lucide-react";
import { useMemo } from "react";
import { IKContext, IKUpload } from "imagekitio-react";

const authenticator = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error) {
    throw new Error(`Authentication request failed: ${(error as Error).message}`);
  }
};

interface ImageKitUploadProps {
  onSuccess: (url: string) => void;
  onError: (error: Error) => void;
}

const ImageKitUpload = ({ onSuccess, onError }: ImageKitUploadProps) => {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

  const ikUploadRef = (el: any) => {
    if (el) {
      el.addEventListener("change", (e: any) => {
        if (e.target.files && e.target.files.length > 0) {
          // you can use upload function to upload files programmatically
          // ikUploadRef.current.upload(e.target.files[0]);
        }
      });
    }
  };

  const memoizedIKContext = useMemo(() => {
    return (
      <IKContext
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticator={authenticator}
      >
        <IKUpload
          inputRef={ikUploadRef}
          onSuccess={(res) => onSuccess(res.url)}
          onError={onError}
          style={{ display: "none" }}
        />
      </IKContext>
    );
  }, [publicKey, urlEndpoint, onSuccess, onError]);

  return (
    <div>
      <label
        htmlFor="image-upload"
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors cursor-pointer"
      >
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Clique para fazer upload ou arraste as imagens
        </p>
        <p className="text-xs text-muted-foreground">
          Mínimo de 5 imagens, máximo de 20
        </p>
      </label>
      {memoizedIKContext}
    </div>
  );
};

export default ImageKitUpload;
