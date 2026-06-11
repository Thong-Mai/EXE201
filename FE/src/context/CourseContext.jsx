import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CourseContext = createContext();
const BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';


// Seed data representing blockchain and financial education courses
const INITIAL_COURSES = [
  {
    id: 'C01',
    title: 'Phần 1: ETF & Chứng chỉ quỹ',
    category: 'ETF',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
    duration: '5 phút',
    level: 'Cơ bản',
    difficulty: 'Dễ',
    timeEstimated: '5 phút',
    progress: 0,
    tags: ['ETF', 'Cơ bản'],
    description: 'ETF & Chứng chỉ quỹ cho người mới bắt đầu. Tiết kiệm thời gian, đa dạng hóa tối đa.',
    lessons: [
      {
        id: 'L1.1',
        title: 'ETF & Chứng chỉ quỹ cho người mới',
        videoUrl: 'https://www.youtube.com/embed/BLaWYP4-1N4',
        reading: 'Nội dung bài học:\nETF (Exchange-Traded Fund) là một loại quỹ đầu tư được giao dịch trên sàn chứng khoán giống như cổ phiếu. Thay vì mua riêng lẻ từng cổ phiếu, nhà đầu tư có thể mua một ETF để sở hữu nhiều loại tài sản cùng lúc.\n\nVí dụ:\nMột ETF có thể bao gồm cổ phiếu của Apple, Microsoft, Google và Amazon. Khi mua ETF, người dùng đang đầu tư vào cả danh mục thay vì một công ty duy nhất.\n\nLợi ích của ETF:\n- Đa dạng hóa danh mục đầu tư\n- Giảm rủi ro hơn so với mua một cổ phiếu riêng lẻ\n- Chi phí thấp hơn nhiều quỹ truyền thống\n- Phù hợp với người mới bắt đầu\n\nRủi ro cần biết:\n- ETF vẫn chịu ảnh hưởng bởi biến động thị trường\n- Không đảm bảo lợi nhuận\n- Một số ETF có phí quản lý\n\nVí dụ thực tế:\nNếu một người chỉ mua cổ phiếu của 1 công ty và công ty đó giảm mạnh, họ có thể lỗ nhiều. Nhưng ETF giúp chia tiền vào nhiều công ty khác nhau nên rủi ro thấp hơn.\n\nNguồn tham khảo:\n- Investopedia – ETF Definition\n- SEC Investor.gov – ETF Basics'
      }
    ],
    quizzes: [
      {
        question: 'ETF là gì?',
        options: ['A. Ví điện tử', 'B. Quỹ đầu tư giao dịch trên sàn', 'C. Tiền điện tử', 'D. Tài khoản tiết kiệm'],
        answerIndex: 1,
        explanation: 'ETF (Exchange-Traded Fund) là quỹ đầu tư được giao dịch trên sàn chứng khoán tương tự như một mã cổ phiếu thông thường.'
      },
      {
        question: 'Ưu điểm lớn của ETF là gì?',
        options: ['A. Không có rủi ro', 'B. Đảm bảo lợi nhuận', 'C. Đa dạng hóa đầu tư', 'D. Giá luôn tăng'],
        answerIndex: 2,
        explanation: 'Ưu điểm lớn nhất của ETF là đa dạng hóa. Sở hữu chứng chỉ quỹ giúp phân bổ vốn vào hàng chục doanh nghiệp lớn cùng lúc.'
      },
      {
        question: 'ETF thường phù hợp với đối tượng nào?',
        options: ['A. Chỉ chuyên gia tài chính', 'B. Người mới bắt đầu đầu tư', 'C. Chỉ doanh nghiệp lớn', 'D. Người không muốn học tài chính'],
        answerIndex: 1,
        explanation: 'ETF rất thích hợp với người mới bắt đầu vì nó không yêu cầu quá nhiều kỹ năng phân tích báo cáo tài chính từng mã cổ phiếu đơn lẻ.'
      },
      {
        question: 'Khi mua chứng chỉ quỹ ETF, nhà đầu tư đang thực hiện việc gì?',
        options: ['A. Đầu tư tập trung vào một cổ phiếu duy nhất', 'B. Đầu tư gián tiếp vào toàn bộ danh mục cổ phiếu trong rổ chỉ số', 'C. Gửi tiết kiệm lấy lãi cố định', 'D. Mua các hợp đồng phái sinh đòn bẩy'],
        answerIndex: 1,
        explanation: 'Sở hữu chứng chỉ quỹ ETF tương đương việc bạn đầu tư gián tiếp vào toàn bộ các doanh nghiệp có trong danh mục cơ cấu của quỹ đó.'
      },
      {
        question: 'Một rủi ro tiềm ẩn của quỹ ETF là gì?',
        options: ['A. ETF không thể giao dịch trên sàn chứng khoán', 'B. Giá chứng chỉ quỹ ETF có thể biến động giảm theo xu hướng chung của thị trường', 'C. Phí quản lý luôn cao hơn quỹ chủ động', 'D. Không bao giờ nhận được cổ tức'],
        answerIndex: 1,
        explanation: 'Dù đa dạng hóa tốt, ETF vẫn chịu rủi ro hệ thống của thị trường chung. Khi thị trường giảm, giá chứng chỉ quỹ cũng giảm.'
      }
    ]
  },
  {
    id: 'C02',
    title: 'Phần 2: Lãi kép',
    category: 'Savings',
    thumbnail: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=400&q=80',
    duration: '5 phút',
    level: 'Cơ bản',
    difficulty: 'Dễ',
    timeEstimated: '5 phút',
    progress: 0,
    tags: ['Lãi kép', 'Cơ bản'],
    lessons: [
      {
        id: 'L2.1',
        title: 'Sức mạnh của lãi kép',
        videoUrl: 'https://www.youtube.com/embed/_CbicTTCkjg',
        reading: 'Nội dung bài học:\nLãi kép là quá trình mà tiền lãi bạn kiếm được tiếp tục tạo ra thêm tiền lãi mới theo thời gian. Đây được xem là một trong những yếu tố quan trọng nhất trong đầu tư dài hạn.\n\nVí dụ:\nBạn đầu tư 1 triệu đồng với lợi nhuận 10%/năm.\n- Sau năm đầu tiên, bạn có 1.100.000 đồng.\n- Năm tiếp theo, lợi nhuận sẽ được tính trên 1.100.000 đồng chứ không còn là 1 triệu đồng ban đầu.'
      }
    ],
    quizzes: [
      {
        question: 'Lãi kép hoạt động như thế nào?',
        options: ['A. Chỉ tính lãi trên số tiền ban đầu', 'B. Lãi tiếp tục sinh ra thêm lãi mới', 'C. Không liên quan đến đầu tư', 'D. Chỉ áp dụng cho ngân hàng'],
        answerIndex: 1,
        explanation: 'Lãi kép sinh ra do lãi thu được của chu kỳ trước được gộp chung vào vốn để tiếp tục sinh lãi ở các chu kỳ sau.'
      },
      {
        question: 'Yếu tố nào sau đây đóng vai trò quyết định nhất đến sức mạnh của lãi kép trong dài hạn?',
        options: ['A. Tần suất giao dịch liên tục mỗi ngày', 'B. Thời gian tích lũy dài hạn', 'C. Chọn các mã cổ phiếu giá rẻ', 'D. Số tiền vốn ban đầu cực lớn'],
        answerIndex: 1,
        explanation: 'Thời gian chính là yếu tố nhân cấp số mũ cho lãi kép. Bắt đầu càng sớm và duy trì càng lâu, tài sản sinh lời càng vượt bậc.'
      },
      {
        question: 'Công thức tính lãi kép cơ bản là gì? (Với P là vốn gốc, r là lãi suất năm, n là số lần ghép lãi/năm, t là số năm)',
        options: ['A. A = P * (1 + r * t)', 'B. A = P * (1 + r/n)^(n*t)', 'C. A = P / (1 + r)^t', 'D. A = P + r * t'],
        answerIndex: 1,
        explanation: 'Công thức tính giá trị tương lai với lãi kép là A = P * (1 + r/n)^(n*t).'
      },
      {
        question: 'Quy tắc 72 trong tài chính được dùng để làm gì?',
        options: ['A. Tính số tiền thuế phải nộp', 'B. Ước lượng số năm để số tiền đầu tư tăng gấp đôi với lãi suất cố định', 'C. Xác định tỷ lệ lạm phát hàng năm', 'D. Tính toán phí quản lý quỹ'],
        answerIndex: 1,
        explanation: 'Quy tắc 72 giúp ước lượng nhanh số năm để tài sản nhân đôi: Số năm = 72 / (Lãi suất hàng năm %).'
      },
      {
        question: 'If you receive interest from a savings account and spend it all immediately, what happens?',
        options: ['A. Bạn vẫn đang tận dụng lãi kép', 'B. Bạn chỉ nhận được lãi đơn ở chu kỳ tiếp theo', 'C. Tài khoản của bạn sẽ tự động bị khóa', 'D. Bạn sẽ phải trả thêm phí phạt rút lãi'],
        answerIndex: 1,
        explanation: 'Nếu tiêu hết tiền lãi, chu kỳ tiếp theo bạn chỉ nhận lãi trên phần vốn gốc ban đầu, tức là lãi đơn, không tận dụng được hiệu ứng lãi chồng lãi.'
      }
    ]
  },
  {
    id: 'C03',
    title: 'Phần 3: Đa dạng hóa danh mục',
    category: 'Risk',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80',
    duration: '5 phút',
    level: 'Trung bình',
    difficulty: 'Trung bình',
    timeEstimated: '5 phút',
    progress: 0,
    tags: ['Rủi ro', 'Đa dạng hóa'],
    lessons: [
      {
        id: 'L3.1',
        title: 'Đừng bỏ tất cả trứng vào một giỏ',
        videoUrl: 'https://www.youtube.com/embed/Qx3Gt8z6jCY',
        reading: 'Nội dung bài học:\nĐa dạng hóa là chiến lược phân bổ tiền đầu tư vào nhiều loại tài sản khác nhau nhằm giảm rủi ro.'
      }
    ],
    quizzes: [
      {
        question: 'Mục tiêu chính của đa dạng hóa là gì?',
        options: ['A. Tăng rủi ro', 'B. Giảm rủi ro đầu tư', 'C. Tránh đóng thuế', 'D. Đầu tư nhanh hơn'],
        answerIndex: 1,
        explanation: 'Đa dạng hóa giúp giảm thiểu thiệt hại lớn khi một trong các kênh đầu tư riêng lẻ bị biến động bất lợi.'
      },
      {
        question: 'Phương pháp nào thể hiện sự đa dạng hóa danh mục đầu tư đúng đắn?',
        options: ['A. Đầu tư toàn bộ tiền vào 1 mã cổ phiếu duy nhất', 'B. Phân bổ vốn vào nhiều lớp tài sản (tiết kiệm, trái phiếu, cổ phiếu, chứng chỉ quỹ) khác nhau', 'C. Mua 10 mã cổ phiếu khác nhau nhưng đều thuộc cùng một ngành bất động sản', 'D. Vay nợ tối đa để mua vàng'],
        answerIndex: 1,
        explanation: 'Đa dạng hóa đúng đắn yêu cầu phân bổ vốn vào các lớp tài sản hoặc các ngành nghề ít có sự tương quan đồng biến với nhau.'
      },
      {
        question: 'Câu thành ngữ kinh điển nào mô tả nguyên lý của đa dạng hóa danh mục?',
        options: ['A. Tích tiểu thành đại', 'B. Đừng bỏ tất cả trứng vào một giỏ', 'C. High risk, high return', 'D. Buôn có bạn, bán có phường'],
        answerIndex: 1,
        explanation: '"Đừng bỏ tất cả trứng vào một giỏ" khuyên nhà đầu tư phân tán rủi ro để nếu một giỏ bị rơi (một khoản đầu tư thua lỗ), các khoản khác vẫn an toàn.'
      },
      {
        question: 'Đa dạng hóa danh mục đầu tư giúp triệt tiêu loại rủi ro nào?',
        options: ['A. Rủi ro hệ thống (như khủng hoảng kinh tế toàn cầu)', 'B. Rủi ro phi hệ thống (rủi ro riêng lẻ của từng doanh nghiệp)', 'C. Mọi rủi ro thua lỗ trên thị trường', 'D. Rủi ro lạm phát tiền tệ'],
        answerIndex: 1,
        explanation: 'Đa dạng hóa giúp giảm thiểu tối đa rủi ro phi hệ thống (rủi ro từ sự cố riêng lẻ của một doanh nghiệp hoặc ngành cụ thể).'
      },
      {
        question: 'Điều nào sau đây KHÔNG phải là đa dạng hóa danh mục?',
        options: ['A. Sở hữu một chứng chỉ quỹ ETF VN30', 'B. Mua cả cổ phiếu, trái phiếu và gửi tiết kiệm', 'C. Gom toàn bộ tiền mua cổ phiếu của một công ty duy nhất đang tăng nóng', 'D. Đầu tư vào các doanh nghiệp thuộc nhiều ngành nghề khác nhau'],
        answerIndex: 2,
        explanation: 'Mua cổ phiếu của một công ty duy nhất là đầu tư tập trung rủi ro cao, hoàn toàn trái ngược với đa dạng hóa.'
      }
    ]
  },
  {
    id: 'C04',
    title: 'Phần 4: Tâm lý đầu tư',
    category: 'Risk',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    duration: '4 phút',
    level: 'Trung bình',
    difficulty: 'Trung bình',
    timeEstimated: '4 phút',
    progress: 0,
    tags: ['Tâm lý', 'Trung bình'],
    lessons: [
      {
        id: 'L4.1',
        title: 'Kiểm soát cảm xúc khi đầu tư',
        videoUrl: 'https://www.youtube.com/embed/3QzJx3kK1oo',
        reading: 'Nội dung bài học:\nCảm xúc là một trong những yếu tố ảnh hưởng lớn đến quyết định đầu tư.'
      }
    ],
    quizzes: [
      {
        question: 'FOMO trong đầu tư là gì?',
        options: ['A. Một loại cổ phiếu', 'B. Sợ bỏ lỡ cơ hội đầu tư', 'C. Một quỹ ETF', 'D. Một loại thuế'],
        answerIndex: 1,
        explanation: 'FOMO (Fear of Missing Out) là tâm lý sợ bỏ lỡ cơ hội kiếm lợi nhuận khi thấy đám đông đang hào hứng.'
      },
      {
        question: 'Khi thấy thị trường giảm mạnh và đám đông hoảng loạn bán tháo, một nhà đầu tư kỷ luật nên làm gì?',
        options: ['A. Bán tháo theo đám đông bằng mọi giá', 'B. Bình tĩnh đánh giá lại giá trị cốt lõi của tài sản và tuân thủ kế hoạch dài hạn', 'C. Vay nóng để bắt đáy mà không cần phân tích', 'D. Xóa app và không bao giờ đầu tư nữa'],
        answerIndex: 1,
        explanation: 'Nhà đầu tư kỷ luật cần tránh tâm lý hoảng loạn bầy đàn, kiên định với kế hoạch phân bổ tài sản dài hạn đã lập.'
      },
      {
        question: 'Thiên kiến tâm lý "Loss Aversion" (Sợ thua lỗ) ảnh hưởng thế nào đến quyết định đầu tư?',
        options: ['A. Giúp nhà đầu tư cắt lỗ cực nhanh', 'B. Khiến nhà đầu tư gồng lỗ quá lâu và chốt lời non vì sợ mất lợi nhuận hiện có', 'C. Làm tăng lòng tham của nhà đầu tư', 'D. Giúp đưa ra quyết định lý trí hoàn hảo'],
        answerIndex: 1,
        explanation: 'Nghiên cứu cho thấy nỗi đau mất tiền lớn gấp đôi niềm vui kiếm tiền, dẫn đến xu hướng gồng lỗ vô kỷ luật để trốn tránh thực tế.'
      },
      {
        question: 'Hành vi mua tài sản liên tục dựa trên tin đồn không kiểm chứng từ các hội nhóm mạng xã hội được gọi là gì?',
        options: ['A. Đầu tư giá trị dài hạn', 'B. Tâm lý bầy đàn (Herd Mentality)', 'C. Phân tích cơ bản chuyên sâu', 'D. Phòng vệ rủi ro chủ động'],
        answerIndex: 1,
        explanation: 'Tâm lý bầy đàn khiến nhà đầu tư làm theo đám đông mà không tự nghiên cứu, phân tích, dễ rơi vào các bẫy xả hàng.'
      },
      {
        question: 'Cách tốt nhất để giảm thiểu tác động của cảm xúc (FOMO và Hoảng loạn) khi đầu tư là gì?',
        options: ['A. Giao dịch liên tục trong ngày theo biến động giá', 'B. Lập kế hoạch đầu tư rõ ràng, định kỳ mua tích lũy (DCA) và tuân thủ kỷ luật', 'C. Nghe theo mọi lời khuyên của người nổi tiếng trên mạng', 'D. Chỉ đầu tư khi thị trường đang tăng cực mạnh'],
        answerIndex: 1,
        explanation: 'Chiến lược tích lũy định kỳ (DCA) kết hợp kế hoạch dài hạn là công cụ hữu hiệu nhất giúp loại bỏ cảm xúc ngắn hạn ra khỏi quyết định đầu tư.'
      }
    ]
  },
  {
    id: 'C05',
    title: 'Phần 5: Lạm phát',
    category: 'Inflation',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    duration: '4 phút',
    level: 'Cơ bản',
    difficulty: 'Dễ',
    timeEstimated: '4 phút',
    progress: 0,
    tags: ['Lạm phát', 'Cơ bản'],
    lessons: [
      {
        id: 'L5.1',
        title: 'Tiền mất giá theo thời gian',
        videoUrl: 'https://www.youtube.com/embed/DHdEAtes8H8',
        reading: 'Nội dung bài học:\nLạm phát là hiện tượng giá hàng hóa và dịch vụ tăng theo thời gian.'
      }
    ],
    quizzes: [
      {
        question: 'Lạm phát ảnh hưởng như thế nào đến tiền?',
        options: ['A. Tăng sức mua', 'B. Giảm sức mua theo thời gian', 'C. Không thay đổi gì', 'D. Tăng lương tự động'],
        answerIndex: 1,
        explanation: 'Lạm phát làm tăng mức giá chung của hàng hóa dịch vụ, khiến cùng một lượng tiền mua được ít đồ hơn.'
      },
      {
        question: 'Khi lạm phát tăng cao, lớp tài sản nào thường mất giá trị thực tế nhanh nhất nếu để yên?',
        options: ['A. Bất động sản', 'B. Tiền mặt không sinh lãi', 'C. Cổ phiếu của các doanh nghiệp đầu ngành', 'D. Vàng vật chất'],
        answerIndex: 1,
        explanation: 'Tiền mặt để yên sẽ mất sức mua trực tiếp khi giá cả hàng hóa leo thang do lạm phát.'
      },
      {
        question: '"Lạm phát kỳ vọng" có thể dẫn đến hành vi nào ở người tiêu dùng?',
        options: ['A. Tiết kiệm nhiều tiền mặt hơn', 'B. Trì hoãn việc mua sắm hàng hóa', 'C. Đẩy nhanh việc mua sắm hoặc đầu tư để tránh tiền mất giá', 'D. Ngừng hoàn toàn việc mua sắm'],
        answerIndex: 2,
        explanation: 'Kỳ vọng giá tăng trong tương lai thúc đẩy mọi người mua sắm tài sản hoặc hàng hóa sớm hơn để bảo vệ sức mua.'
      },
      {
        question: 'Lạm phát vừa phải (khoảng 2-3% mỗi năm) thường được các ngân hàng trung ương xem là:',
        options: ['A. Một thảm họa kinh tế cần triệt tiêu', 'B. Dấu hiệu của nền kinh tế đang tăng trưởng ổn định', 'C. Nguyên nhân gây khủng hoảng tài chính toàn cầu', 'D. Kết quả của việc in quá ít tiền'],
        answerIndex: 1,
        explanation: 'Lạm phát nhẹ, ổn định kích thích tiêu dùng và đầu tư, đồng thời phản ánh một nền kinh tế đang hoạt động tích cực.'
      },
      {
        question: 'Kênh nào sau đây thường được chọn để phòng vệ lạm phát trong dài hạn?',
        options: ['A. Giữ tiền mặt trong két sắt', 'B. Đầu tư vào tài sản thực (bất động sản, vàng) hoặc cổ phiếu/ETF tăng trưởng', 'C. Mở tài khoản thanh toán không kỳ hạn lãi suất 0%', 'D. Cho vay không lãi suất'],
        answerIndex: 1,
        explanation: 'Cổ phiếu, bất động sản và vàng là những tài sản có khả năng tăng giá trị tương ứng hoặc vượt trội hơn tốc độ lạm phát theo thời gian.'
      }
    ]
  },
  {
    id: 'C06',
    title: 'Phần 6 (VIP): Phân tích Báo cáo Tài chính chuyên sâu',
    category: 'Analysis',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
    duration: '10 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '10 phút',
    progress: 0,
    tags: ['BCTC', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L6.1',
        title: 'Đọc hiểu 3 báo cáo tài chính cốt lõi',
        videoUrl: 'https://www.youtube.com/embed/NF0macnGe2Y',
        reading: 'Báo cáo tài chính là bức tranh toàn cảnh về sức khỏe của doanh nghiệp.'
      }
    ],
    quizzes: [
      {
        question: 'Báo cáo nào giúp nhận diện dòng tiền mặt thực tế của doanh nghiệp?',
        options: ['A. Bảng cân đối kế toán', 'B. Báo cáo lưu chuyển tiền tệ', 'C. Báo cáo kết quả hoạt động kinh doanh', 'D. Thuyết minh báo cáo tài chính'],
        answerIndex: 1,
        explanation: 'Báo cáo lưu chuyển tiền tệ là thước đo chính xác dòng tiền mặt thực tế ra vào doanh nghiệp.'
      },
      {
        question: 'Bảng cân đối kế toán thể hiện điều gì của doanh nghiệp?',
        options: ['A. Doanh thu và lợi nhuận của doanh nghiệp trong một kỳ kế toán', 'B. Bức tranh tài sản, nợ phải trả và vốn chủ sở hữu tại một thời điểm nhất định', 'C. Lịch sử giao dịch tiền mặt của các cổ đông lớn', 'D. Kế hoạch kinh doanh 5 năm tới của hội đồng quản trị'],
        answerIndex: 1,
        explanation: 'Bảng cân đối kế toán cung cấp thông tin về cấu trúc tài chính của doanh nghiệp gồm Tài sản = Nợ phải trả + Vốn chủ sở hữu tại thời điểm lập báo cáo.'
      },
      {
        question: 'Doanh nghiệp có lợi nhuận kế toán cao trên Báo cáo kết quả kinh doanh nhưng vẫn có thể bị phá sản vì lý do nào?',
        options: ['A. Đóng quá nhiều thuế thu nhập', 'B. Thiếu hụt dòng tiền mặt thực tế để thanh toán các khoản nợ đến hạn (khủng hoảng thanh khoản)', 'C. Giá cổ phiếu trên sàn giảm mạnh', 'D. Chia quá nhiều cổ tức cho cổ đông'],
        answerIndex: 1,
        explanation: 'Lợi nhuận kế toán được ghi nhận theo nguyên tắc dồn tích, không đồng nghĩa với tiền mặt thực tế. Nếu tiền mặt bị kẹt ở hàng tồn kho hoặc khoản phải thu, doanh nghiệp sẽ mất thanh khoản.'
      },
      {
        question: 'Chỉ số P/E (Price-to-Earnings Ratio) được dùng để làm gì?',
        options: ['A. Tính toán số lượng nhân sự của doanh nghiệp', 'B. Đo lường mối quan hệ giữa giá cổ phiếu và lợi nhuận trên mỗi cổ phần (EPS)', 'C. Xác định tỷ lệ nợ trên vốn chủ sở hữu', 'D. Dự báo thời gian khấu hao tài sản cố định'],
        answerIndex: 1,
        explanation: 'P/E cho biết nhà đầu tư sẵn sàng trả bao nhiêu tiền cho mỗi đồng lợi nhuận của doanh nghiệp.'
      },
      {
        question: 'Khoản mục "Phải thu khách hàng" quá lớn và liên tục tăng mạnh trên bảng cân đối kế toán cảnh báo rủi ro gì?',
        options: ['A. Doanh nghiệp đang bán được quá nhiều hàng thu tiền ngay', 'B. Doanh nghiệp ghi nhận doanh thu ảo hoặc gặp khó khăn trong việc thu hồi nợ từ đối tác', 'C. Vốn chủ sở hữu của doanh nghiệp đang tăng mạnh', 'D. Doanh nghiệp chuẩn bị tăng vốn điều lệ'],
        answerIndex: 1,
        explanation: 'Khoản phải thu tăng nhanh hơn doanh thu là dấu hiệu doanh nghiệp bán hàng cho nợ nhiều, nguy cơ nợ xấu cao và dòng tiền kinh doanh bị thâm hụt.'
      }
    ]
  },
  {
    id: 'C07',
    title: 'Phần 7 (VIP): Định giá Cổ phiếu DCF & P/E',
    category: 'Valuation',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80',
    duration: '12 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '12 phút',
    progress: 0,
    tags: ['Định giá', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L7.1',
        title: 'Phương pháp định giá dòng tiền chiết khấu (DCF)',
        videoUrl: 'https://www.youtube.com/embed/Ay4xpWYfSgg',
        reading: 'Định giá dòng tiền chiết khấu (Discounted Cash Flow) dựa trên nguyên tắc: một đồng tiền tương lai có giá trị thấp hơn hiện tại.'
      }
    ],
    quizzes: [
      {
        question: 'Nguyên lý cốt lõi của phương pháp DCF là gì?',
        options: ['A. Định giá dựa trên tài sản cố định', 'B. Chiết khấu dòng tiền tự do tương lai về giá trị hiện tại', 'C. So sánh giá cổ phiếu với đối thủ', 'D. Chỉ tính giá trị sổ sách'],
        answerIndex: 1,
        explanation: 'Phương pháp DCF tính giá trị nội tại của công ty bằng cách quy đổi toàn bộ lượng tiền tự do tương lai về hiện tại.'
      },
      {
        question: 'Trong định giá P/E so sánh, một cổ phiếu có P/E thấp hơn nhiều so với trung bình ngành luôn có nghĩa là gì?',
        options: ['A. Cổ phiếu đó chắc chắn đang rẻ và là cơ hội đầu tư tốt', 'B. Có thể cổ phiếu đang rẻ (dưới giá trị) hoặc doanh nghiệp đang gặp vấn đề nghiêm trọng khiến tăng trưởng sụt giảm', 'C. Cổ phiếu đó có rủi ro phá sản ngay lập tức', 'D. Doanh nghiệp đó không có nợ vay'],
        answerIndex: 1,
        explanation: 'P/E thấp có thể do định giá rẻ hoặc do thị trường đánh giá doanh nghiệp có triển vọng kém. Cần phân tích sâu để tránh "bẫy giá trị".'
      },
      {
        question: 'Yếu tố nào sau đây là đầu vào quan trọng nhất của mô hình chiết khấu dòng tiền DCF?',
        options: ['A. Giá cổ phiếu cao nhất trong lịch sử', 'B. Ước tính dòng tiền tự do (FCFF/FCFE) tương lai và tỷ lệ chiết khấu (WACC)', 'C. Khối lượng giao dịch bình quân 10 ngày', 'D. Số lượng thành viên trong hội đồng quản trị'],
        answerIndex: 1,
        explanation: 'DCF định giá doanh nghiệp bằng cách dự báo các dòng tiền tự do trong tương lai và chiết khấu chúng về hiện tại bằng một tỷ suất chiết khấu phù hợp.'
      },
      {
        question: 'Tỷ suất chiết khấu (Discount Rate) tăng lên sẽ ảnh hưởng thế nào đến giá trị nội tại ước tính theo DCF?',
        options: ['A. Làm tăng giá trị nội tại', 'B. Làm giảm giá trị nội tại', 'C. Không có ảnh hưởng gì', 'D. Làm tăng doanh thu doanh nghiệp'],
        answerIndex: 1,
        explanation: 'Vì tỷ suất chiết khấu nằm ở mẫu số của công thức quy đổi tiền về hiện tại, tỷ suất này tăng sẽ làm giảm giá trị quy đổi hiện tại.'
      },
      {
        question: '"Biên an toàn" (Margin of Safety) trong đầu tư giá trị là gì?',
        options: ['A. Khoản tiền gửi tiết kiệm dự phòng của nhà đầu tư', 'B. Chênh lệch chiết khấu giữa giá trị nội tại ước tính và giá thị trường hiện tại của cổ phiếu', 'C. Tỷ lệ ký quỹ (margin) tối đa công ty chứng khoán cho phép', 'D. Bảo hiểm tài khoản chứng khoán chống thua lỗ'],
        answerIndex: 1,
        explanation: 'Biên an toàn là khoảng đệm giúp bảo vệ nhà đầu tư khi giá mua thấp hơn đáng kể so với giá trị nội tại của doanh nghiệp, đề phòng sai số trong dự báo.'
      }
    ]
  },
  {
    id: 'C08',
    title: 'Phần 8 (VIP): Quản lý vốn & Phân bổ tài sản tích lũy',
    category: 'Wealth',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    duration: '8 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '8 phút',
    progress: 0,
    tags: ['Quản lý vốn', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L8.1',
        title: 'Tái cân bằng danh mục tài sản định kỳ',
        videoUrl: 'https://www.youtube.com/embed/DtVYnlov8PI',
        reading: 'Tái cân bằng (Rebalancing) là hành động đưa tỷ trọng các lớp tài sản về mức thiết lập ban đầu.'
      }
    ],
    quizzes: [
      {
        question: 'Tại sao cần tái cân bằng danh mục đầu tư?',
        options: ['A. Để mua nhiều cổ phiếu hơn', 'B. Để duy trì mức độ rủi ro mong muốn ban đầu', 'C. Để tránh mất phí', 'D. Để đầu cơ ngắn hạn'],
        answerIndex: 1,
        explanation: 'Tái cân bằng giúp kiểm soát rủi ro danh mục, ngăn ngừa việc một loại tài sản tăng quá nóng chiếm quá nhiều tỷ trọng.'
      },
      {
        question: 'Chiến lược phân bổ tài sản (Asset Allocation) nên phụ thuộc chủ yếu vào các yếu tố nào của cá nhân?',
        options: ['A. Độ tuổi, khẩu vị rủi ro và mục tiêu tài chính dài hạn', 'B. Số lượng bạn bè đang đầu tư cùng', 'C. Xu hướng tăng giảm của thị trường trong tuần tới', 'D. Khuyến nghị của các diễn đàn chứng khoán'],
        answerIndex: 0,
        explanation: 'Phân bổ tài sản là thiết lập tỷ trọng các lớp tài sản phù hợp với khả năng chấp nhận rủi ro, độ tuổi và kế hoạch dòng tiền của mỗi người.'
      },
      {
        question: 'Khi thực hiện tái cân bằng (Rebalancing) từ danh mục lệch tỷ trọng do cổ phiếu tăng quá mạnh, hành động đúng là:',
        options: ['A. Tiếp tục vay nợ mua thêm cổ phiếu đó để gia tăng lợi nhuận', 'B. Bán bớt một phần cổ phiếu đã tăng nóng để mua thêm các tài sản an toàn (như trái phiếu) nhằm đưa về tỷ trọng mục tiêu', 'C. Bán sạch toàn bộ danh mục và rút tiền về', 'D. Giữ nguyên không làm gì'],
        answerIndex: 1,
        explanation: 'Tái cân bằng yêu cầu bán bớt lớp tài sản tăng vượt tỷ trọng mục tiêu để mua lớp tài sản đang dưới tỷ trọng, giúp hiện thực hóa lợi nhuận và kiểm soát rủi ro.'
      },
      {
        question: 'Quy tắc "100 trừ đi độ tuổi" thường được gợi ý để xác định điều gì?',
        options: ['A. Số tiền tiết kiệm hàng tháng', 'B. Tỷ lệ phần trăm nên phân bổ vào tài sản rủi ro (như cổ phiếu) trong danh mục', 'C. Tuổi nghỉ hưu tối đa của bạn', 'D. Số lượng cổ phiếu tối đa bạn nên sở hữu'],
        answerIndex: 1,
        explanation: 'Ví dụ, nếu bạn 30 tuổi, tỷ lệ cổ phiếu gợi ý là 100 - 30 = 70%. Tuổi càng cao, tỷ lệ tài sản an toàn (trái phiếu/tiết kiệm) nên tăng lên.'
      },
      {
        question: 'Một danh mục đầu tư chỉ bao gồm 100% cổ phiếu công nghệ tăng trưởng cao phù hợp nhất với ai?',
        options: ['A. Người chuẩn bị nghỉ hưu cần dòng tiền ổn định an toàn', 'B. Nhà đầu tư trẻ tuổi, có thu nhập ổn định và khẩu vị rủi ro cao', 'C. Người đang có khoản nợ ngắn hạn lớn phải trả', 'D. Người có khẩu vị rủi ro phòng thủ'],
        answerIndex: 1,
        explanation: 'Danh mục 100% cổ phiếu biến động mạnh chỉ thích hợp với người trẻ có thời gian dài hạn để phục hồi sau các đợt sụt giảm thị trường và có dòng tiền độc lập.'
      }
    ]
  },
  {
    id: 'C09',
    title: 'Phần 9 (VIP): Đầu tư Phái sinh & Phòng ngừa rủi ro',
    category: 'Analysis',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
    duration: '8 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '8 phút',
    progress: 0,
    tags: ['Phái sinh', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L9.1',
        title: 'Cơ chế hoạt động của Hợp đồng Tương lai',
        videoUrl: 'https://www.youtube.com/embed/KFUfOYaWKEw',
        reading: 'Hợp đồng tương lai (Futures Contract) cho phép giao dịch dựa trên kỳ vọng chỉ số VN30 tăng hoặc giảm.'
      }
    ],
    quizzes: [
      {
        question: 'Lợi thế của hợp đồng tương lai phái sinh là gì?',
        options: ['A. An toàn tuyệt đối', 'B. Giao dịch hai chiều (kiếm lời khi thị trường giảm)', 'C. Không yêu cầu ký quỹ', 'D. Phí giao dịch bằng 0'],
        answerIndex: 1,
        explanation: 'Phái sinh cho phép bạn thực hiện vị thế Short để kiếm lời khi dự đoán thị trường đi xuống.'
      },
      {
        question: '"Bán khống" (Short Selling / Short Position) trong giao dịch phái sinh là hành động giúp nhà đầu tư kiếm lợi nhuận khi nào?',
        options: ['A. Khi giá tài sản cơ sở tăng mạnh', 'B. Khi giá tài sản cơ sở giảm xuống', 'C. Khi thị trường đi ngang không biến động', 'D. Chỉ khi doanh nghiệp chia cổ tức'],
        answerIndex: 1,
        explanation: 'Vị thế Short cho phép người tham gia bán trước ở giá cao và mua lại để đóng vị thế ở giá thấp hơn, kiếm lời từ chênh lệch giảm giá.'
      },
      {
        question: 'Giao dịch ký quỹ (Margin) trong chứng khoán phái sinh mang lại hiệu ứng gì?',
        options: ['A. Loại bỏ hoàn toàn rủi ro thua lỗ', 'B. Đòn bẩy tài chính giúp nhân nhiều lần lợi nhuận kỳ vọng nhưng cũng nhân tương ứng mức độ rủi ro thua lỗ', 'C. Đảm bảo lợi nhuận cố định hàng tháng', 'D. Giảm phí giao dịch xuống mức 0'],
        answerIndex: 1,
        explanation: 'Ký quỹ cho phép giao dịch quy mô lớn với số vốn nhỏ. Đây là con dao hai lưỡi, có thể gây cháy tài khoản cực nhanh nếu thị trường đi ngược dự đoán.'
      },
      {
        question: 'Mục đích chính của việc sử dụng phái sinh để "phòng vệ rủi ro" (Hedging) của các tổ chức là gì?',
        options: ['A. Đầu cơ kiếm lợi nhuận chớp nhoáng', 'B. Bảo vệ danh mục cổ phiếu cơ sở trước các đợt giảm giá mạnh của thị trường chung', 'C. Thay thế hoàn toàn việc mua cổ phiếu doanh nghiệp', 'D. Tránh việc phải nộp thuế thu nhập'],
        answerIndex: 1,
        explanation: 'Hedging sử dụng các vị thế phái sinh đối ứng (như Short hợp đồng tương lai) để bù trừ thiệt hại giảm giá của danh mục cổ phiếu cơ sở đang nắm giữ.'
      },
      {
        question: 'Yêu cầu gọi ký quỹ bổ sung (Margin Call) xảy ra khi nào?',
        options: ['A. Khi số dư tài khoản ký quỹ của bạn tăng vượt mức trần', 'B. Khi thị trường biến động ngược hướng vị thế của bạn làm tỷ lệ tài sản ròng giảm dưới mức duy trì an toàn', 'C. Khi bạn muốn mở thêm tài khoản giao dịch mới', 'D. Khi doanh nghiệp phái sinh chia cổ tức'],
        answerIndex: 1,
        explanation: 'Margin Call yêu cầu bạn phải nộp thêm tiền hoặc bán bớt vị thế để đưa tài khoản về tỷ lệ an toàn khi khoản lỗ tạm tính vượt quá giới hạn cho phép.'
      }
    ]
  },
  {
    id: 'C10',
    title: 'Phần 10 (VIP): Tâm lý học hành vi trong đầu tư',
    category: 'Risk',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80',
    duration: '7 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '7 phút',
    progress: 0,
    tags: ['Tâm lý', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L10.1',
        title: 'Thiên kiến sợ thua lỗ (Loss Aversion)',
        videoUrl: 'https://www.youtube.com/embed/47RGK6sGL-Y',
        reading: 'Nghiên cứu tâm lý chỉ ra: Cảm giác đau đớn khi mất tiền lớn gấp đôi niềm vui khi kiếm được tiền tương đương.'
      }
    ],
    quizzes: [
      {
        question: 'Thiên kiến sợ thua lỗ thường dẫn đến hành vi sai lầm nào?',
        options: ['A. Cắt lỗ quá nhanh', 'B. Gồng lỗ quá lâu và chốt lời quá sớm', 'C. Chỉ mua trái phiếu', 'D. Đa dạng hóa quá mức'],
        answerIndex: 1,
        explanation: 'Sợ thua lỗ khiến nhà đầu tư gồng lỗ vô kỷ luật để tránh nhận mình sai, đồng thời bán chốt lời non vì sợ mất lợi nhuận hiện có.'
      },
      {
        question: 'Thiên kiến tự tin thái quá (Overconfidence Bias) thường khiến nhà đầu tư làm gì?',
        options: ['A. Đa dạng hóa danh mục quá mức', 'B. Giao dịch quá nhiều và đánh giá thấp rủi ro thực tế của thị trường', 'C. Trì hoãn việc ra quyết định đầu tư', 'D. Chỉ gửi tiền tiết kiệm ngân hàng'],
        answerIndex: 1,
        explanation: 'Tự tin thái quá khiến mọi người tin rằng họ có thể dự báo thị trường chính xác hơn thực tế, dẫn đến giao dịch liên tục làm tốn phí và thua lỗ.'
      },
      {
        question: 'Thiên kiến xác nhận (Confirmation Bias) là gì?',
        options: ['A. Việc xác minh thông tin tài khoản ngân hàng bảo mật', 'B. Xuuyên hướng chỉ tìm kiếm, tin tưởng các thông tin ủng hộ quan điểm cá nhân và phớt lờ các ý kiến phản biện trái chiều', 'C. Việc nhận được email xác nhận giao dịch thành công', 'D. Việc tuân thủ tuyệt đối quy trình phân bổ tài sản'],
        answerIndex: 1,
        explanation: 'Thiên kiến xác nhận khiến nhà đầu tư chỉ đọc tin tốt về cổ phiếu họ đang nắm giữ và bỏ qua các dấu hiệu cảnh báo doanh nghiệp đang đi xuống.'
      },
      {
        question: 'Hiện tượng nhà đầu tư neo giữ quyết định mua/bán vào mức giá vốn ban đầu mà họ đã mua, bất kể tình hình doanh nghiệp thay đổi thế nào được gọi là:',
        options: ['A. Thiên kiến neo quyết định (Anchoring Bias)', 'B. Thiên kiến sẵn có (Availability Bias)', 'C. Tư duy trực quan Socratic', 'D. Quản lý danh mục chủ động'],
        answerIndex: 0,
        explanation: 'Neo giá khiến nhà đầu tư không chịu bán cắt lỗ hoặc chốt lời hợp lý vì cứ so sánh với giá vốn lịch sử (điểm neo) của chính mình.'
      },
      {
        question: 'Để khắc phục các thiên kiến hành vi cá nhân, hành động thiết thực nhất là gì?',
        options: ['A. Tin tưởng hoàn toàn vào trực giác của bản thân khi giao dịch', 'B. Thiết lập quy tắc đầu tư tự động hóa, ghi chép nhật ký giao dịch và tuân thủ kỷ luật danh mục', 'C. Theo dõi bảng điện tử liên tục từng giây', 'D. Đổi công ty chứng khoán thường xuyên'],
        answerIndex: 1,
        explanation: 'Kỷ luật, tự động hóa và ghi chép nhật ký giúp bạn nhìn nhận khách quan, tránh các phản ứng cảm xúc tức thời do thiên kiến gây ra.'
      }
    ]
  },
  {
    id: 'C11',
    title: 'Phần 11 (VIP): Chiến lược Quỹ mở và Quỹ chỉ số ETF',
    category: 'ETF',
    thumbnail: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=400&q=80',
    duration: '9 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '9 phút',
    progress: 0,
    tags: ['Quỹ mở', 'ETF', 'VIP'],
    lessons: [
      {
        id: 'L11.1',
        title: 'Phương pháp tích lũy DCA Quỹ chỉ số',
        videoUrl: 'https://www.youtube.com/embed/5Wp7ba-EWeA',
        reading: 'Chiến thuật trung bình hóa chi phí (DCA) bằng cách mua định kỳ hàng tuần hoặc hàng tháng một số tiền cố định.'
      }
    ],
    quizzes: [
      {
        question: 'Chiến lược DCA hiệu quả nhất khi kết hợp với loại tài sản nào?',
        options: ['A. Cổ phiếu đầu cơ', 'B. Quỹ chỉ số ETF đa dạng hóa cao', 'C. Tiết kiệm ngắn hạn', 'D. Tiền mặt không sinh lãi'],
        answerIndex: 1,
        explanation: 'DCA phát huy hiệu quả tốt nhất khi kết hợp với các tài sản có xu hướng tăng trưởng dài hạn.'
      },
      {
        question: 'Lợi thế lớn nhất của chiến lược Trung bình giá (DCA) là gì?',
        options: ['A. Đảm bảo mua được cổ phiếu tại mức giá thấp nhất lịch sử', 'B. Loại bỏ áp lực canh thời điểm thị trường (market timing) và giảm chi phí mua bình quân dài hạn nhờ tích lũy kỷ luật', 'C. Giúp giàu nhanh chỉ trong vài tuần', 'D. Miễn phí hoàn toàn các loại thuế giao dịch'],
        answerIndex: 1,
        explanation: 'DCA giúp bạn mua nhiều chứng chỉ quỹ hơn khi giá thấp và mua ít hơn khi giá cao, giúp tối ưu hóa giá vốn dài hạn một cách tự động.'
      },
      {
        question: 'Điểm khác biệt cốt lõi giữa Quỹ mở chủ động (Mutual Fund) và Quỹ chỉ số ETF bị động là gì?',
        options: ['A. Quỹ mở không có phí quản lý', 'B. Quỹ mở chủ động được các chuyên gia chọn lọc cổ phiếu để cố gắng chiến thắng thị trường, còn ETF mô phỏng nguyên vẹn một rổ chỉ số cố định', 'C. ETF chỉ đầu tư vào vàng', 'D. Quỹ mở có rủi ro cao hơn phái sinh'],
        answerIndex: 1,
        explanation: 'Quỹ chủ động dựa vào năng lực chọn lọc của nhà quản lý quỹ và thường có phí cao hơn. Quỹ ETF chạy theo chỉ số một cách tự động với phí quản lý cực thấp.'
      },
      {
        question: 'Chỉ số rổ VN DIAMOND (mô phỏng bởi ETF FUEVFVND) tập trung chủ yếu vào nhóm cổ phiếu nào?',
        options: ['A. Các doanh nghiệp nhà nước sắp cổ phần hóa', 'B. Các cổ phiếu hàng đầu có tỷ lệ sở hữu của khối ngoại đạt trần (hết room ngoại) và nền tảng cơ bản cực tốt', 'C. Các công ty khởi nghiệp công nghệ mới', 'D. Các doanh nghiệp ngành khai khoáng và dầu khí'],
        answerIndex: 1,
        explanation: 'Rổ chỉ số VN Diamond thu hút dòng vốn lớn nhờ tập trung các cổ phiếu đầu ngành chất lượng cao mà nhà đầu tư nước ngoài không thể mua trực tiếp do hết giới hạn sở hữu.'
      },
      {
        question: 'Khi bạn tích lũy dài hạn quỹ chỉ số ETF trong 10 năm, yếu tố nào ảnh hưởng lớn nhất đến lợi nhuận ròng cuối cùng của bạn?',
        options: ['A. Tỷ suất phí quản lý hàng năm của quỹ và tính kỷ luật duy trì DCA đều đặn', 'B. Việc dự đoán chính xác các điểm đảo chiều của thị trường mỗi tháng', 'C. Tin tức chính trị hàng ngày trên mạng xã hội', 'D. Màu sắc của logo công ty quản lý quỹ'],
        answerIndex: 0,
        explanation: 'Trong dài hạn, chi phí quản lý thấp (đặc trưng của ETF) cộng với sức mạnh tích lũy đều đặn không gián đoạn là chìa khóa tạo nên lợi nhuận ròng tối ưu.'
      }
    ]
  }
];

export function CourseProvider({ children }) {
  const { user } = useAuth();
  
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [userProgress, setUserProgress] = useState({});

  // 1. Fetch all courses from backend on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/courses`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCourses(data);
          }
        }
      } catch (err) {
        console.error('Error fetching courses from database:', err);
      }
    };
    fetchCourses();
  }, []);

  // 2. Fetch user progress whenever user changes
  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem('saveplus_token');
      if (token && user) {
        try {
          const res = await fetch(`${BASE_URL}/courses/progress`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUserProgress(data);
            
            // Map the progress into local courses state for display
            setCourses(prev => prev.map(c => {
              const prog = data[c.id];
              return prog ? { ...c, progress: prog.progressPercent || 0 } : { ...c, progress: 0 };
            }));
          }
        } catch (err) {
          console.error('Error fetching course progress:', err);
        }
      } else {
        setUserProgress({});
        setCourses(prev => prev.map(c => ({ ...c, progress: 0 })));
      }
    };
    fetchProgress();
  }, [user]);

  const addCourse = async (newCourse) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/courses/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCourse)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const formatted = {
        ...data,
        tags: data.tags ? JSON.parse(data.tags) : [],
        lessons: data.lessons ? JSON.parse(data.lessons) : [],
        quizzes: data.quizzes ? JSON.parse(data.quizzes) : [],
        progress: 0
      };

      setCourses(prev => [...prev, formatted]);
      return formatted;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi thêm khóa học.');
    }
  };

  const updateCourse = async (updated) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/courses/manage/${updated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const formatted = {
        ...data,
        tags: data.tags ? JSON.parse(data.tags) : [],
        lessons: data.lessons ? JSON.parse(data.lessons) : [],
        quizzes: data.quizzes ? JSON.parse(data.quizzes) : [],
        progress: updated.progress || 0
      };

      setCourses(prev => prev.map(c => c.id === updated.id ? formatted : c));
      return formatted;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi cập nhật khóa học.');
    }
  };

  const deleteCourse = async (id) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/courses/manage/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi xóa khóa học.');
    }
  };

  const recordLessonRead = async (courseId, lessonId) => {
    const token = localStorage.getItem('saveplus_token');
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/courses/${courseId}/lessons/${lessonId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUserProgress(prev => ({
        ...prev,
        [courseId]: {
          lessonsRead: data.lessonsRead,
          quizCompleted: data.quizCompleted,
          progressPercent: data.progressPercent
        }
      }));

      setCourses(prev => prev.map(c => {
        if (c.id === courseId) {
          return { ...c, progress: data.progressPercent };
        }
        return c;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const completeCourseQuiz = async (courseId) => {
    const token = localStorage.getItem('saveplus_token');
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/courses/${courseId}/quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUserProgress(prev => ({
        ...prev,
        [courseId]: {
          lessonsRead: data.lessonsRead,
          quizCompleted: data.quizCompleted,
          progressPercent: data.progressPercent
        }
      }));

      setCourses(prev => prev.map(c => {
        if (c.id === courseId) {
          return { ...c, progress: data.progressPercent };
        }
        return c;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const resetAllProgress = async () => {
    const token = localStorage.getItem('saveplus_token');
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/courses/reset-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUserProgress({});
      setCourses(prev => prev.map(c => ({ ...c, progress: 0 })));
    } catch (err) {
      console.error(err);
    }
  };

  const resetCourseProgress = async (courseId) => {
    const token = localStorage.getItem('saveplus_token');
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/courses/${courseId}/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUserProgress(prev => {
        const nextProg = { ...prev };
        delete nextProg[courseId];
        return nextProg;
      });
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, progress: 0 } : c));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CourseContext.Provider value={{
      courses,
      userProgress,
      addCourse,
      updateCourse,
      deleteCourse,
      recordLessonRead,
      completeCourseQuiz,
      setCourses,
      setUserProgress,
      resetAllProgress,
      resetCourseProgress
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  return useContext(CourseContext);
}
