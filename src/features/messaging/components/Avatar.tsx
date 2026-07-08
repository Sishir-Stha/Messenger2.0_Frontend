interface AvatarProps {
  name: string;
  imageUrl?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export function Avatar({ name, imageUrl, isOnline, size = 'md' }: AvatarProps) {
  return (
    <span className={`avatar avatar--${size}`} aria-label={name}>
      {imageUrl ? <img src={imageUrl} alt="" /> : <span>{getInitials(name)}</span>}
      {isOnline ? <span className="avatar__status" aria-label="Online" /> : null}
    </span>
  );
}
