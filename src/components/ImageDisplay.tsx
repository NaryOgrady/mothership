import styles from './ImageDisplay.module.css';

interface ImageDisplayProps {
  imageUrl: string;
  greenFilter: boolean;
}

export function ImageDisplay({ imageUrl, greenFilter }: ImageDisplayProps) {
  if (!imageUrl) {
    return <div className={styles.empty}>No image set.</div>;
  }
  return (
    <div className={styles.wrap}>
      <img src={imageUrl} alt="" className={`${styles.image} ${greenFilter ? styles.greenFilter : ''}`} />
    </div>
  );
}
