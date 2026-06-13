const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

// Tuyến đường xử lý GET (Hứng dữ liệu sinh ra từ cột Construct URL của Glide)
app.get('/pdf', async (req, res) => {
    // Đọc mã HTML được truyền trực tiếp trên thanh địa chỉ thông qua tham số ?html=
    const htmlContent = req.query.html;
    
    if (!htmlContent) {
        return res.status(400).send('Không tìm thấy dữ liệu HTML gửi lên sếp ơi!');
    }

    let browser;
    try {
        // Khởi động trình duyệt ảo ngầm
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });
        const page = await browser.newPage();
        
        // Nạp code HTML báo cáo của xưởng vào
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Ép khuôn sang file PDF khổ ngang A4
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true, // Xoay ngang giấy cho chuẩn 11 cột báo cáo
            printBackground: true // Giữ nguyên đường kẻ bảng và màu sắc
        });

        // Trả file trực tiếp về trình duyệt để in luôn
        res.contentType("application/pdf");
        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).send('Lỗi hệ thống khi render PDF: ' + error.message);
    } finally {
        // Luôn giải phóng bộ nhớ sau khi in xong
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`Wizard Hà Anh đang chạy ở cổng ${PORT}`);
});
