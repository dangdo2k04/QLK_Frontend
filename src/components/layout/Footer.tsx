const Footer: React.FC = () => {
  return (
    <div style={{
      backgroundColor: '#0a293cff',
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
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8Q1qmKhKTNd_S2up7hCB9sH9eExXEKiXFLQ&s" alt="ShopMoHinh Logo" style={{ height: '50px' }} /> {/* Thay bằng logo thực tế */}
        <p>VUAMOHINH - Chuyên MÔ HÌNH Ô TÔ CHẤT LƯỢNG</p>
      </div>
      <div>
        <h3 style={{ marginBottom: '10px' }}>CHĂM SÓC KHÁCH HÀNG</h3>
        <p><a href="https://zalo.me/0973625157" style={{ color: '#ff5722', textDecoration: 'none' }}>Zalo</a></p>
        <p><a href="https://www.facebook.com/groups/mohinhviet/" style={{ color: '#ff5722', textDecoration: 'none' }}>CLB MÔ HÌNH VIỆT</a></p>
        <p><a href="tel:0973625157" style={{ color: '#ff5722', textDecoration: 'none' }}>📞 Hotline: 0973625157</a></p>
        <p><a href="mailto:daotheanh58@gmail.com" style={{ color: '#ff5722', textDecoration: 'none' }}>daotheanh58@gmail.com</a></p>
      </div>
      <div>
        <h3 style={{ marginBottom: '10px' }}>LIÊN HỆ HỖ TRỢ</h3>
        <p><a href="https://zalo.me/0973625157" style={{ color: '#ff5722', textDecoration: 'none' }}>Zalo</a></p>
        <p><a href="https://www.facebook.com/groups/mohinhviet/" style={{ color: '#ff5722', textDecoration: 'none' }}>CLB MÔ HÌNH VIỆT</a></p>
        <p><a href="tel:0973625157" style={{ color: '#ff5722', textDecoration: 'none' }}>📞 Hotline: 0973625157</a></p>
        <p><a href="mailto:daotheanh58@gmail.com" style={{ color: '#ff5722', textDecoration: 'none' }}>daotheanh58@gmail.com</a></p>
      </div>
      <div>
        <p>Phát triển bởi SHOPTY.VN</p>
        <p>Phiên bản: Custom</p>
      </div>
    </div>
  );
};
export default Footer;