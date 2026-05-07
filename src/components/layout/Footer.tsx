const Footer: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'rgb(255, 146, 219)',
      color: '#fff',
      padding: '20px',
      textAlign: 'center',
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <div>
        <img src="https://sf-static.upanhlaylink.com/img/image_20251018e2d6e4e3ba6b85242ea957a766812144.jpg" alt="ShopMoHinh Logo" style={{ height: '50px' }} /> {/* Thay bằng logo thực tế */}
        <p>DANGDOBRICK - Chuyên cung cấp những mẫu lego đa dạng, chất lượng và giá cả hợp lí</p>
      </div>
      <div>
        <h3 style={{ marginBottom: '10px' }}>CHĂM SÓC KHÁCH HÀNG</h3>
        <p><a href="http://zalo.me/84367607226" style={{ color: '#26ff00', textDecoration: 'none' }}>Zalo</a></p>
        <p><a href="https://web.facebook.com/clblegovietnam" style={{ color: '#26ff00', textDecoration: 'none' }}>CLB LEGO VIỆT NAM</a></p>
        <p><a href="tel:0367688688" style={{ color: '#26ff00', textDecoration: 'none' }}>📞 Hotline: 0367688688</a></p>
        <p><a href="mailto:dangdo123321@gmail.com" style={{ color: '#26ff00', textDecoration: 'none' }}>dangdo123321@gmail.com</a></p>
      </div>
      <div>
        <h3 style={{ marginBottom: '10px' }}>LIÊN HỆ HỖ TRỢ</h3>
        <p><a href="http://zalo.me/84367607226" style={{ color: '#26ff00', textDecoration: 'none' }}>Zalo</a></p>
        <p><a href="https://web.facebook.com/clblegovietnam" style={{ color: '#26ff00', textDecoration: 'none' }}>CLB LEGO VIỆT NAM</a></p>
        <p><a href="tel:0367688688" style={{ color: '#26ff00', textDecoration: 'none' }}>📞 Hotline: 0367688688</a></p>
        <p><a href="mailto:dangdo123321@gmail.com" style={{ color: '#26ff00', textDecoration: 'none' }}>dangdo123321@gmail.com</a></p>
      </div>
      <div>
        <p>Phát triển bởi DANGHOANG</p>
        <p>Phiên bản: Custom</p>
      </div>
    </div>
  );
};
export default Footer;