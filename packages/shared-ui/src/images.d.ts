declare module "*.png" {
  const content: string | { src: string; height: number; width: number; blurDataURL?: string };
  export default content;
}

declare module "*.jpg" {
  const content: string | { src: string; height: number; width: number; blurDataURL?: string };
  export default content;
}

declare module "*.jpeg" {
  const content: string | { src: string; height: number; width: number; blurDataURL?: string };
  export default content;
}

declare module "*.svg" {
  const content: string | { src: string; height: number; width: number; blurDataURL?: string };
  export default content;
}

declare module "*.webp" {
  const content: string | { src: string; height: number; width: number; blurDataURL?: string };
  export default content;
}
