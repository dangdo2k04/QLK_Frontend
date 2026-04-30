interface ProductLabelProps {
  text: string;
  color?: string;
}

const ProductLabel: React.FC<ProductLabelProps> = ({ text, color = '#ff0004ff' }) => (
  <span
    style={{
      position: 'absolute',
      top: '5px',
      left: '5px',
      backgroundColor: color,
      color: 'red',
      padding: '5px 10px',
      borderRadius: '5px',
      fontSize: '0.9em',
      fontWeight: 'bold',
    }}
  >
    {text}
  </span>
);
export default ProductLabel;