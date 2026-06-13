const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Cấu hình nhận dữ liệu HTML siêu lớn gửi ngầm từ Glide lên (Hạn mức 50MB)
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

// 2. Tuyến đường xử lý chính (Nhận dữ liệu dạng POST)
app.post('/pdf', async (req, res) => {
    // Đọc mã HTML được gửi từ Glide qua tham số có tên là "html"
    const htmlContent = req.body.html;
    
    if (!htmlContent) {
        return res.status(400).send('Không tìm thấy dữ liệu HTML gửi lên sếp ơi!');
    }

    let browser;
    try {
        // 3. Khởi động trình duyệt ảo ngầm (Headless Chrome) tối ưu cho Railway
        browser = await puppeteer.launch({
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
        const page = await browser.newPage();
        
        // 4. Nạp code HTML báo cáo vào trình duyệt ảo
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // 5. Ép khuôn sang file PDF khổ ngang A4 siêu nét
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true, // Xoay ngang giấy cho vừa khít 11 cột báo cáo
            printBackground: true // Giữ nguyên màu sắc, viền bảng biểu khung in
        });

        // 6. Trả file trực tiếp về trình duyệt để ấn lệnh in luôn
        res.contentType("application/pdf");
        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).send('Lỗi hệ thống khi render PDF: ' + error.message);
    } finally {
        // Luôn đóng trình duyệt ngầm sau khi in xong để giải phóng RAM, chống sập server
        if (browser) await browser.close();
    }
});

// Kích hoạt cổng chạy cho con Server
app.listen(PORT, () => {
    console.log(`Wizard Hà Anh đang chạy mượt mà ở cổng ${PORT}`);
});
