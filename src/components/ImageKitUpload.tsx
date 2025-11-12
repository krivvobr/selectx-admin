import { Upload } from "lucide-react";
import { useMemo } from "react";
import { IKContext, IKUpload } from "imagekitio-react";
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

const authenticator = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

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

  const handleUploadClick = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div>
      <IKContext
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticator={authenticator}
      >
        <label
          onClick={handleUploadClick}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors cursor-pointer block"
        >
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Clique para fazer upload ou arraste as imagens
          </p>
          <p className="text-xs text-muted-foreground">
            Mínimo de 5 imagens, máximo de 20
          </p>
        </label>
        <IKUpload
          onSuccess={(res) => onSuccess(res.url)}
          onError={onError}
          style={{ display: 'none' }}
        />
      </IKContext>
    </div>
  );
};

export default ImageKitUpload;
