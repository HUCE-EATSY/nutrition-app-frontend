import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppColors } from "@/hooks/useAppColors";
import { useSettingsStore } from "@/store/settingsStore";
import { radius, spacing, typography, shadows } from "@/constants";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
}

interface HelpCategory {
  id: string;
  name: string;
  articles: HelpArticle[];
}

interface SupportTicket {
  ticketNumber: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  type: "text" | "options" | "ticket" | "article";
  text?: string;
  options?: { label: string; action: string }[];
  data?: any;
  createdAt: string;
}

const LOCAL_FAQS = (isVi: boolean): FaqItem[] => [
  {
    id: "faq-1",
    question: isVi ? "Làm thế nào để chỉnh lượng nước mục tiêu?" : "How do I adjust my daily water goal?",
    answer: isVi 
      ? "Bạn có thể vào tab Tài khoản -> tùy chỉnh mục tiêu -> mục tiêu khác -> lượng nước (ml) hoặc bấm nút đặt mục tiêu trực tiếp tại màn hình ghi nước để cập nhật."
      : "You can go to the Account tab -> customize goal -> other goals -> water intake (ml) or press the set goal button directly in the water log screen to update."
  },
  {
    id: "faq-2",
    question: isVi ? "Tại sao số bước chân không tự động cập nhật?" : "Why are my steps not updating automatically?",
    answer: isVi
      ? "Vui lòng kiểm tra xem bạn đã cấp quyền đếm bước chân chưa. Hãy vào cài đặt hệ thống của điện thoại, tìm ứng dụng Wao và bật quyền truy cập hoạt động thể chất/vận động."
      : "Please check if you have granted step-counting permission. Go to your phone's system settings, find the Wao app, and enable physical activity/motion permission."
  },
  {
    id: "faq-3",
    question: isVi ? "Làm thế nào để thay đổi mật khẩu tài khoản?" : "How do I change my password or account details?",
    answer: isVi
      ? "Ứng dụng hỗ trợ đăng nhập liên kết bảo mật qua Google và Facebook. Thông tin tài khoản của bạn sẽ đồng bộ trực tiếp với tài khoản mạng xã hội tương ứng."
      : "The application supports secure social login via Google and Facebook. Your profile details synchronize directly with the corresponding social account."
  },
  {
    id: "faq-4",
    question: isVi ? "Lượng Calo mục tiêu được tính toán như thế nào?" : "How is my daily calorie goal calculated?",
    answer: isVi
      ? "Hệ thống sử dụng công thức Mifflin-St Jeor chuẩn y khoa dựa trên giới tính, chiều cao, cân nặng, độ tuổi và mức độ hoạt động để đưa ra chỉ số calo mục tiêu tối ưu."
      : "The system uses the medical-standard Mifflin-St Jeor formula based on your gender, height, weight, age, and activity level to estimate your optimal target calorie intake."
  },
  {
    id: "faq-5",
    question: isVi ? "Chế độ Premium mang lại lợi ích gì?" : "What benefits does the Premium plan provide?",
    answer: isVi
      ? "Gói Premium mở khóa các phân tích dinh dưỡng đa lượng sâu hơn, gợi ý bữa ăn thông minh từ AI Mascot và lưu trữ dữ liệu nhật ký không giới hạn thời gian."
      : "The Premium plan unlocks deep macronutrient analytics, intelligent meal suggestions from our AI Mascot, and unlimited storage history for your nutrition logs."
  }
];

const LOCAL_HELP_CATEGORIES = (isVi: boolean): HelpCategory[] => [
  {
    id: "cat-account",
    name: isVi ? "Tài khoản & Bảo mật" : "Account & Security",
    articles: [
      {
        id: "art-login",
        title: isVi ? "Hướng dẫn liên kết Google/Facebook" : "Linking Google/Facebook accounts",
        content: isVi
          ? "Để liên kết tài khoản, chọn 'Tiếp tục với Google' hoặc 'Facebook' tại màn hình đăng nhập. Hệ thống sẽ tự động đồng bộ hóa thông tin tiến trình một cách bảo mật."
          : "To link your account, choose 'Continue with Google' or 'Facebook' at the welcome screen. The system will automatically synchronize your details and progress securely."
      },
      {
        id: "art-delete",
        title: isVi ? "Cách xóa vĩnh viễn dữ liệu tài khoản" : "How to delete account data permanently",
        content: isVi
          ? "Nếu muốn bắt đầu lại từ đầu, hãy vào tab Tài khoản -> cài đặt -> 'Xóa toàn bộ dữ liệu'. Hành động này sẽ xóa vĩnh viễn tất cả lịch sử bữa ăn, cân nặng, bài tập trên máy chủ và không thể khôi phục."
          : "If you want to start over, go to Account tab -> settings -> 'Delete all data'. This action will permanently delete all your meal history, weight, and workouts on our server and cannot be undone."
      }
    ]
  },
  {
    id: "cat-nutrition",
    name: isVi ? "Ghi chép Dinh dưỡng" : "Nutrition Logging",
    articles: [
      {
        id: "art-log-meal",
        title: isVi ? "Cách ghi bữa ăn vào nhật ký" : "How to record a meal in your diary",
        content: isVi
          ? "Nhấn nút '+' ở thanh menu dưới -> chọn 'Ghi bữa ăn'. Tìm món ăn trong thanh tìm kiếm, nhập số gram tương ứng và chọn khung giờ ăn (sáng/trưa/tối/phụ) rồi bấm 'Thêm'."
          : "Press the '+' button on the bottom menu -> select 'Log Meal'. Search for the food item, enter the weight in grams, choose the time slot (breakfast/lunch/dinner/snack), and tap 'Add'."
      },
      {
        id: "art-create-recipe",
        title: isVi ? "Hướng dẫn tạo công thức món ăn mới" : "How to create a custom recipe",
        content: isVi
          ? "Để tạo công thức, bấm nút '+' -> chọn 'Tạo công thức'. Thêm các nguyên liệu đơn lẻ và khối lượng tương ứng, hệ thống sẽ tự tính toán tổng calo, protein, carbs, fat cho món ăn."
          : "To create a recipe, tap the '+' button -> select 'Create Recipe'. Add individual ingredients and their weights. The system will calculate the total calories, protein, carbs, and fat."
      }
    ]
  },
  {
    id: "cat-workout",
    name: isVi ? "Tập luyện & Hoạt động" : "Workouts & Activity",
    articles: [
      {
        id: "art-log-workout",
        title: isVi ? "Cách ghi hoạt động thể thao thủ công" : "How to log workout activity manually",
        content: isVi
          ? "Nhấp vào biểu tượng hoạt động thể thao tại trang chủ hoặc nhấn '+' -> 'Ghi hoạt động'. Chọn loại bài tập (chạy bộ, đạp xe, gym...), nhập thời gian tập (phút), chọn cường độ và lưu lại."
          : "Click on the workout activity icon on the homepage or press '+' -> 'Log Activity'. Select the exercise type (running, cycling, strength...), enter duration in minutes, choose intensity, and save."
      },
      {
        id: "art-sync-steps",
        title: isVi ? "Khắc phục lỗi không đếm bước chân" : "Troubleshooting step counting issues",
        content: isVi
          ? "Đảm bảo bạn đã cấp quyền Hoạt động thể chất cho ứng dụng Wao. Nếu bước chân vẫn không đổi, vui lòng tắt ứng dụng, khởi động lại điện thoại và đi bộ khoảng 20 bước để kích hoạt lại cảm biến."
          : "Ensure you have granted Physical Activity permission to the Wao app. If steps do not update, force close the app, restart your phone, and walk about 20 steps to reactivate the sensors."
      }
    ]
  }
];

const getInitialMessage = (isVietnamese: boolean): ChatMessage => ({
  id: "welcome",
  sender: "bot",
  type: "text",
  text: isVietnamese 
    ? "Xin chào! Tôi là Trợ lý Ảo Wao. Tôi có thể giúp gì cho bạn hôm nay?" 
    : "Hello! I am your Wao Virtual Assistant. How can I help you today?",
  options: [
    { label: isVietnamese ? "Câu hỏi thường gặp ❓" : "FAQs ❓", action: "FAQ" },
    { label: isVietnamese ? "Tài liệu hướng dẫn 📚" : "Help Guides 📚", action: "HELP" },
    { label: isVietnamese ? "Gửi yêu cầu hỗ trợ ✉️" : "Send Support Ticket ✉️", action: "TICKET" }
  ],
  createdAt: new Date().toISOString()
});

export default function SupportScreen() {
  const colors = useAppColors();
  const language = useSettingsStore((state) => state.language);
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, insets), [colors, insets]);

  const isVi = language === "vi";
  const tLocal = {
    title: isVi ? "Hỗ trợ khách hàng" : "Customer Support",
    subjectLabel: isVi ? "Tiêu đề yêu cầu" : "Subject",
    messageLabel: isVi ? "Nội dung cần hỗ trợ" : "Message",
    ticketHistory: isVi ? "Lịch sử yêu cầu" : "Ticket History",
    noTickets: isVi ? "Bạn chưa gửi yêu cầu hỗ trợ nào." : "You have not submitted any tickets yet.",
    ticketSuccess: isVi ? "Đã gửi yêu cầu thành công!" : "Ticket submitted successfully!",
    estimatedResponse: isVi ? "Phản hồi dự kiến: Trong vòng 24h làm việc" : "Expected response: Within 24 business hours",
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Guided Ticket Flow state
  const [ticketFlow, setTicketFlow] = useState<{
    step: "idle" | "awaiting_subject" | "awaiting_message";
    subject?: string;
  } | null>(null);

  // Tickets history
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize chatbot conversation
  useEffect(() => {
    setMessages([getInitialMessage(isVi)]);
    setTicketFlow(null);
  }, [isVi]);

  // Scroll to bottom when messages list updates or bot is typing
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      type: "text",
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // 1. If currently in guided ticketing flow
      if (ticketFlow) {
        if (ticketFlow.step === "awaiting_subject") {
          if (text.trim().length < 5) {
            const botMsg: ChatMessage = {
              id: `bot-${Date.now()}`,
              sender: "bot",
              type: "text",
              text: isVi 
                ? "Tiêu đề quá ngắn. Vui lòng nhập tiêu đề yêu cầu dài hơn (tối thiểu 5 ký tự):" 
                : "Subject is too short. Please enter a longer subject (min 5 characters):",
              createdAt: new Date().toISOString()
            };
            setMessages((prev) => [...prev, botMsg]);
          } else {
            setTicketFlow({ step: "awaiting_message", subject: text.trim() });
            const botMsg: ChatMessage = {
              id: `bot-${Date.now()}`,
              sender: "bot",
              type: "text",
              text: isVi 
                ? "Cảm ơn bạn. Tiếp theo, hãy mô tả chi tiết vấn đề của bạn (tối thiểu 10 ký tự):" 
                : "Thank you. Next, please describe your problem in detail (min 10 characters):",
              createdAt: new Date().toISOString()
            };
            setMessages((prev) => [...prev, botMsg]);
          }
        } else if (ticketFlow.step === "awaiting_message") {
          if (text.trim().length < 10) {
            const botMsg: ChatMessage = {
              id: `bot-${Date.now()}`,
              sender: "bot",
              type: "text",
              text: isVi 
                ? "Nội dung quá ngắn. Vui lòng nhập mô tả chi tiết hơn (tối thiểu 10 ký tự):" 
                : "Description is too short. Please write a more detailed message (min 10 characters):",
              createdAt: new Date().toISOString()
            };
            setMessages((prev) => [...prev, botMsg]);
          } else {
            // Generate support ticket
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const ticketNumber = `TKT-${dateStr}-${randomSuffix}`;
            
            const newTicket: SupportTicket = {
              ticketNumber,
              subject: ticketFlow.subject || "",
              message: text.trim(),
              status: isVi ? "Đang chờ xử lý" : "Pending",
              createdAt: new Date().toISOString()
            };

            setTickets((prev) => [newTicket, ...prev]);
            setTicketFlow(null);

            const botMsg: ChatMessage = {
              id: `bot-${Date.now()}`,
              sender: "bot",
              type: "ticket",
              text: tLocal.ticketSuccess,
              data: newTicket,
              options: [
                { label: isVi ? "Xem lịch sử yêu cầu 📋" : "View ticket history 📋", action: "VIEW_TICKETS" },
                { label: isVi ? "Trở về trang chủ 🏠" : "Go to Main Menu 🏠", action: "BACK_HOME" }
              ],
              createdAt: new Date().toISOString()
            };
            setMessages((prev) => [...prev, botMsg]);
          }
        }
        return;
      }

      // 2. Normal message freeform matching
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes("nước") || lowerText.includes("water") || lowerText.includes("uống")) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi 
            ? "Để điều chỉnh lượng nước mục tiêu hàng ngày, bạn vui lòng chọn nút 'Đặt mục tiêu' trực tiếp tại màn hình ghi nước hoặc vào tab Tài khoản -> Tùy chỉnh mục tiêu -> Mục tiêu khác -> Lượng nước (ml)."
            : "To adjust your daily water goal, tap the 'Set Goal' button on the water log screen, or navigate to Account tab -> Customize goal -> Other goals -> Water intake (ml).",
          options: [
            { label: isVi ? "Xem FAQ khác ❓" : "Other FAQs ❓", action: "FAQ" },
            { label: isVi ? "Trở về trang chủ 🏠" : "Go to Main Menu 🏠", action: "BACK_HOME" }
          ],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      }
      else if (lowerText.includes("bước") || lowerText.includes("đi bộ") || lowerText.includes("step")) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi 
            ? "Khắc phục lỗi đếm bước chân:\n1. Kiểm tra xem ứng dụng đã được cấp quyền Hoạt động thể chất chưa tại cài đặt hệ thống điện thoại.\n2. Tắt ứng dụng chạy ngầm (force close), khởi động lại điện thoại và đi bộ thử 20 bước để khởi động lại cảm biến."
            : "Troubleshooting steps count:\n1. Verify Physical Activity permissions are enabled for Wao app in your system settings.\n2. Force close the app, restart your device, and walk 20 steps to trigger the hardware sensor.",
          options: [
            { label: isVi ? "Xem FAQ khác ❓" : "Other FAQs ❓", action: "FAQ" },
            { label: isVi ? "Trở về trang chủ 🏠" : "Go to Main Menu 🏠", action: "BACK_HOME" }
          ],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      }
      else if (lowerText.includes("calo") || lowerText.includes("năng lượng") || lowerText.includes("calorie") || lowerText.includes("ăn")) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi 
            ? "Mục tiêu Calo của bạn được tính tự động dựa trên công thức Mifflin-St Jeor thông qua chiều cao, cân nặng, giới tính, độ tuổi và tần suất vận động bạn khai báo."
            : "Your Calorie goal is calculated using the Mifflin-St Jeor formula based on your weight, height, gender, age, and activity level.",
          options: [
            { label: isVi ? "Xem FAQ khác ❓" : "Other FAQs ❓", action: "FAQ" },
            { label: isVi ? "Trở về trang chủ 🏠" : "Go to Main Menu 🏠", action: "BACK_HOME" }
          ],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      }
      else if (lowerText.includes("premium") || lowerText.includes("vip") || lowerText.includes("mua")) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi 
            ? "Gói Premium của Wao hỗ trợ phân tích sâu hơn về dưỡng chất đa lượng, nhận các thực đơn được đề xuất riêng từ AI Mascot của chúng tôi và cho phép xem lịch sử ghi chép không thời hạn."
            : "Wao Premium unlocks advanced macronutrient analysis, personalized diet plans recommended by our AI Mascot, and infinite diary history retention.",
          options: [
            { label: isVi ? "Xem FAQ khác ❓" : "Other FAQs ❓", action: "FAQ" },
            { label: isVi ? "Trở về trang chủ 🏠" : "Go to Main Menu 🏠", action: "BACK_HOME" }
          ],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      }
      else if (lowerText.includes("mật khẩu") || lowerText.includes("tài khoản") || lowerText.includes("login") || lowerText.includes("đăng nhập") || lowerText.includes("google") || lowerText.includes("facebook")) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi 
            ? "Wao đồng bộ thông tin và mật khẩu của bạn trực tiếp thông qua tài khoản Google hoặc Facebook liên kết. Bạn không cần đổi mật khẩu riêng trong app."
            : "Wao securely synchronizes and authenticates your account details directly via Google or Facebook logins. No custom app password is required.",
          options: [
            { label: isVi ? "Xem FAQ khác ❓" : "Other FAQs ❓", action: "FAQ" },
            { label: isVi ? "Trở về trang chủ 🏠" : "Go to Main Menu 🏠", action: "BACK_HOME" }
          ],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      }
      else if (lowerText.includes("xóa") || lowerText.includes("delete")) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi 
            ? "Để xóa vĩnh viễn dữ liệu tài khoản, bạn vào Tab Tài khoản -> Cài đặt -> 'Xóa toàn bộ dữ liệu'. Thao tác này sẽ xóa sạch dữ liệu nhật ký trên máy chủ và không thể hoàn tác."
            : "To delete your account permanently, go to Account tab -> Settings -> 'Delete all data'. This deletes all logged data from our servers forever.",
          options: [
            { label: isVi ? "Xem FAQ khác ❓" : "Other FAQs ❓", action: "FAQ" },
            { label: isVi ? "Trở về trang chủ 🏠" : "Go to Main Menu 🏠", action: "BACK_HOME" }
          ],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      }
      else if (lowerText.includes("hỗ trợ") || lowerText.includes("ticket") || lowerText.includes("gửi") || lowerText.includes("liên hệ") || lowerText.includes("admin")) {
        setTicketFlow({ step: "awaiting_subject" });
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi 
            ? "Tôi sẽ hỗ trợ bạn tạo một yêu cầu trợ giúp mới. Đầu tiên, vui lòng nhập **Tiêu đề của yêu cầu** (tối thiểu 5 ký tự):" 
            : "I'll guide you to submit a support request. First, please type a **Subject** (minimum 5 characters):",
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      }
      else {
        // Fallback option
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi 
            ? "Tôi chưa hiểu rõ câu hỏi của bạn. Vui lòng chọn một trong các tùy chọn hỗ trợ dưới đây:"
            : "I'm not sure I understand. Please choose from one of the support categories below:",
          options: [
            { label: isVi ? "Câu hỏi thường gặp ❓" : "FAQs ❓", action: "FAQ" },
            { label: isVi ? "Tài liệu hướng dẫn 📚" : "Help Guides 📚", action: "HELP" },
            { label: isVi ? "Gửi yêu cầu hỗ trợ ✉️" : "Send Support Ticket ✉️", action: "TICKET" }
          ],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    }, 800);
  };

  const handleOptionPress = (action: string, label: string) => {
    // Render user choice in chat
    const userChoiceMsg: ChatMessage = {
      id: `user-opt-${Date.now()}`,
      sender: "user",
      type: "text",
      text: label,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userChoiceMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      if (action === "FAQ") {
        const faqOptions = LOCAL_FAQS(isVi).map((faq) => ({
          label: faq.question,
          action: `FAQ_ITEM_${faq.id}`
        }));
        
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi ? "Dưới đây là một số câu hỏi thường gặp mà bạn có thể quan tâm:" : "Here are some frequently asked questions:",
          options: [...faqOptions, { label: isVi ? "⬅️ Quay lại danh mục" : "⬅️ Back", action: "BACK_HOME" }],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      } 
      else if (action.startsWith("FAQ_ITEM_")) {
        const faqId = action.replace("FAQ_ITEM_", "");
        const faq = LOCAL_FAQS(isVi).find((f) => f.id === faqId);
        
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: faq ? faq.answer : (isVi ? "Không tìm thấy nội dung." : "Answer not found."),
          options: [
            { label: isVi ? "Xem câu hỏi khác ❓" : "Other FAQs ❓", action: "FAQ" },
            { label: isVi ? "Trở về trang chủ 🏠" : "Go to Main Menu 🏠", action: "BACK_HOME" }
          ],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      } 
      else if (action === "HELP") {
        const catOptions = LOCAL_HELP_CATEGORIES(isVi).map((cat) => ({
          label: cat.name,
          action: `CAT_${cat.id}`
        }));

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi ? "Vui lòng chọn chủ đề bạn đang gặp khó khăn:" : "Please select the topic you need help with:",
          options: [...catOptions, { label: isVi ? "⬅️ Quay lại danh mục" : "⬅️ Back", action: "BACK_HOME" }],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      } 
      else if (action.startsWith("CAT_")) {
        const catId = action.replace("CAT_", "");
        const cat = LOCAL_HELP_CATEGORIES(isVi).find((c) => c.id === catId);
        
        if (cat) {
          const artOptions = cat.articles.map((art) => ({
            label: art.title,
            action: `ART_${art.id}`
          }));

          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            type: "text",
            text: isVi ? `Chủ đề "${cat.name}" gồm có các tài liệu:` : `Category "${cat.name}" contains these resources:`,
            options: [...artOptions, { label: isVi ? "⬅️ Quay lại danh mục" : "⬅️ Back to topics", action: "HELP" }],
            createdAt: new Date().toISOString()
          };
          setMessages((prev) => [...prev, botMsg]);
        }
      } 
      else if (action.startsWith("ART_")) {
        const artId = action.replace("ART_", "");
        let foundArt: HelpArticle | null = null;
        let foundCat: HelpCategory | null = null;

        for (const cat of LOCAL_HELP_CATEGORIES(isVi)) {
          const art = cat.articles.find((a) => a.id === artId);
          if (art) {
            foundArt = art;
            foundCat = cat;
            break;
          }
        }

        if (foundArt && foundCat) {
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            type: "article",
            text: foundArt.content,
            data: { title: foundArt.title },
            options: [
              { label: isVi ? "⬅️ Quay lại danh sách bài viết" : "⬅️ Back to articles list", action: `CAT_${foundCat.id}` },
              { label: isVi ? "Trở về trang chủ 🏠" : "Go to Main Menu 🏠", action: "BACK_HOME" }
            ],
            createdAt: new Date().toISOString()
          };
          setMessages((prev) => [...prev, botMsg]);
        }
      } 
      else if (action === "TICKET") {
        setTicketFlow({ step: "awaiting_subject" });
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi 
            ? "Tôi sẽ hỗ trợ bạn tạo một yêu cầu hỗ trợ. Vui lòng nhập **Tiêu đề yêu cầu** (tối thiểu 5 ký tự) ở ô chat bên dưới:" 
            : "I will assist you in creating a support ticket. Please enter a **Subject** (min 5 characters) in the chat input below:",
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      } 
      else if (action === "VIEW_TICKETS") {
        setShowHistory(true);
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: isVi ? "Tôi đã mở bảng Lịch sử yêu cầu ở phía dưới màn hình của bạn." : "I have opened the Ticket History panel at the bottom of your screen.",
          options: [{ label: isVi ? "Trở về trang chủ 🏠" : "Go to Main Menu 🏠", action: "BACK_HOME" }],
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      } 
      else if (action === "BACK_HOME") {
        const botMsg: ChatMessage = {
          ...getInitialMessage(isVi),
          id: `welcome-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    }, 800);
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={colors.textPrimary} name="chevron-back" size={24} />
          </Pressable>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{tLocal.title}</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{isVi ? "Trực tuyến" : "Online"}</Text>
            </View>
          </View>
          
          <Pressable onPress={() => setShowHistory((prev) => !prev)} style={styles.historyButton}>
            <Ionicons color={colors.textPrimary} name="receipt-outline" size={22} />
            {tickets.length > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{tickets.length}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Chat Thread */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <View key={msg.id} style={[styles.messageRow, isBot ? styles.botRow : styles.userRow]}>
                {isBot && (
                  <View style={styles.botAvatar}>
                    <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
                  </View>
                )}

                <View style={[styles.bubbleWrapper, { alignItems: isBot ? "flex-start" : "flex-end" }]}>
                  <View style={[styles.messageBubble, isBot ? styles.botBubble : styles.userBubble]}>
                    
                    {/* Render Article Details */}
                    {msg.type === "article" && msg.data?.title && (
                      <View style={styles.articleCardBubble}>
                        <View style={styles.articleHeaderRow}>
                          <Ionicons name="document-text" size={18} color={colors.primary} />
                          <Text style={styles.articleTitleBubble}>{msg.data.title}</Text>
                        </View>
                        <View style={styles.articleDivider} />
                      </View>
                    )}

                    {/* Render Ticket Details */}
                    {msg.type === "ticket" && msg.data && (
                      <View style={styles.ticketReceipt}>
                        <Text style={styles.receiptTitle}>{isVi ? "PHIẾU HỖ TRỢ" : "SUPPORT RECEIPT"}</Text>
                        <View style={styles.receiptDivider} />
                        <Text style={styles.receiptLabel}>
                          {isVi ? "Mã yêu cầu:" : "Ticket No:"}{" "}
                          <Text style={styles.receiptValue}>{msg.data.ticketNumber}</Text>
                        </Text>
                        <Text style={styles.receiptLabel}>
                          {isVi ? "Tiêu đề:" : "Subject:"}{" "}
                          <Text style={styles.receiptValue}>{msg.data.subject}</Text>
                        </Text>
                        <Text style={styles.receiptLabel}>
                          {isVi ? "Nội dung:" : "Message:"}{" "}
                          <Text style={styles.receiptValue}>{msg.data.message}</Text>
                        </Text>
                        <View style={styles.receiptDivider} />
                        <Text style={styles.receiptFooter}>{tLocal.estimatedResponse}</Text>
                      </View>
                    )}

                    {/* Render Text Content */}
                    {msg.type !== "ticket" && (
                      <Text style={[styles.messageText, isBot ? styles.botMessageText : styles.userMessageText]}>
                        {msg.text}
                      </Text>
                    )}
                  </View>

                  {/* Render Options if Bot */}
                  {isBot && msg.options && msg.options.length > 0 && (
                    <View style={styles.optionsContainer}>
                      {msg.options.map((opt, idx) => (
                        <Pressable
                          key={`${msg.id}-opt-${idx}`}
                          onPress={() => handleOptionPress(opt.action, opt.label)}
                          style={({ pressed }) => [styles.optionButton, pressed && { opacity: 0.7 }]}
                        >
                          <Text style={styles.optionButtonText}>{opt.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {/* Bot Typing Simulator */}
          {isTyping && (
            <View style={[styles.messageRow, styles.botRow]}>
              <View style={styles.botAvatar}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
              </View>
              <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                <Text style={[styles.messageText, styles.botMessageText, { letterSpacing: 3 }]}>•••</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Collapsible Ticket History Bottom-Sheet Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHistory(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalDismissArea} onPress={() => setShowHistory(false)} />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                  <Text style={styles.modalTitle}>
                    {tLocal.ticketHistory} ({tickets.length})
                  </Text>
                </View>
                <Pressable onPress={() => setShowHistory(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </Pressable>
              </View>
              
              <ScrollView 
                style={styles.modalScroll} 
                contentContainerStyle={{ paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
              >
                {tickets.length === 0 ? (
                  <Text style={styles.emptyText}>{tLocal.noTickets}</Text>
                ) : (
                  tickets.map((t) => (
                    <View key={t.ticketNumber} style={styles.ticketCard}>
                      <View style={styles.ticketCardHeader}>
                        <Text style={styles.ticketNumber}>{t.ticketNumber}</Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: t.status.includes("chờ") || t.status.includes("Pending") ? colors.warning + "22" : colors.success + "22" }
                        ]}>
                          <Text style={[
                            styles.statusBadgeText,
                            { color: t.status.includes("chờ") || t.status.includes("Pending") ? colors.warning : colors.success }
                          ]}>
                            {t.status}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.ticketSubject}>{t.subject}</Text>
                      <Text style={styles.ticketMessage}>{t.message}</Text>
                      
                      <View style={styles.ticketFooter}>
                        <Text style={styles.ticketTime}>
                          {new Date(t.createdAt).toLocaleString(isVi ? "vi-VN" : "en-US", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </Text>
                        <Text style={styles.estimatedResponseText}>{tLocal.estimatedResponse}</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Guided Flow Input Indicator */}
        {ticketFlow && (
          <View style={styles.indicatorFlow}>
            <Ionicons name="create-outline" size={14} color={colors.primary} />
            <Text style={styles.indicatorFlowText}>
              {ticketFlow.step === "awaiting_subject"
                ? (isVi ? "Đang nhập tiêu đề yêu cầu..." : "Entering support subject...")
                : (isVi ? "Đang nhập nội dung chi tiết..." : "Entering support description...")
              }
            </Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            placeholder={
              ticketFlow
                ? (ticketFlow.step === "awaiting_subject"
                  ? (isVi ? "Nhập tiêu đề (tối thiểu 5 kí tự)..." : "Enter subject (min 5 chars)...")
                  : (isVi ? "Nhập nội dung (tối thiểu 10 kí tự)..." : "Enter description (min 10 chars)..."))
                : (isVi ? "Nhập tin nhắn để hỏi Wao..." : "Type a message to ask Wao...")
            }
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => {
              if (inputText.trim()) handleSend(inputText.trim());
            }}
          />
          <Pressable
            onPress={() => {
              if (inputText.trim()) handleSend(inputText.trim());
            }}
            disabled={!inputText.trim()}
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (colors: any, insets: any) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase || "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: insets.top + spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.bgElevated,
    width: "100%",
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  headerInfo: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success || "#28A745",
  },
  onlineText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  historyButton: {
    padding: spacing.xs,
    position: "relative",
  },
  badgeCount: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCountText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: spacing.sm,
    alignItems: "flex-end",
    width: "100%",
  },
  botRow: {
    justifyContent: "flex-start",
    paddingRight: 40,
  },
  userRow: {
    justifyContent: "flex-end",
    paddingLeft: 40,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  bubbleWrapper: {
    flex: 1,
  },
  messageBubble: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    maxWidth: "100%",
    ...shadows.card,
  },
  botBubble: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  messageText: {
    ...typography.body,
    fontSize: 14.5,
    lineHeight: 20,
  },
  botMessageText: {
    color: colors.textPrimary,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  typingBubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  optionsContainer: {
    marginTop: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    width: "100%",
  },
  optionButton: {
    backgroundColor: colors.surface + "44",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  optionButtonText: {
    ...typography.bodyStrong,
    color: colors.primary,
    fontSize: 13,
    textAlign: "center",
  },
  articleCardBubble: {
    width: "100%",
  },
  articleHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  articleTitleBubble: {
    ...typography.bodyStrong,
    color: colors.primary,
    fontSize: 15,
    flex: 1,
  },
  articleDivider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginVertical: spacing.xs,
  },
  ticketReceipt: {
    backgroundColor: colors.surface + "22",
    borderRadius: radius.sm,
    padding: spacing.md,
    width: 250,
  },
  receiptTitle: {
    ...typography.bodyStrong,
    fontSize: 13,
    color: colors.primary,
    textAlign: "center",
    letterSpacing: 1.5,
  },
  receiptDivider: {
    borderStyle: "dashed",
    borderWidth: 0.5,
    borderColor: colors.borderSoft,
    marginVertical: spacing.sm,
  },
  receiptLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  receiptValue: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 13.5,
  },
  receiptFooter: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
    textAlign: "center",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: insets.bottom + spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.bgElevated,
    gap: spacing.md,
    width: "100%",
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.surface + "33",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14.5,
    maxHeight: 100,
    textAlignVertical: "center",
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  indicatorFlow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    gap: 6,
  },
  indicatorFlowText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? spacing.xxl + 10 : spacing.xxl,
    maxHeight: "75%",
    ...shadows.dialog,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  modalTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: 400,
  },
  ticketCard: {
    backgroundColor: colors.surface + "11",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  ticketCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  ticketNumber: {
    ...typography.bodyStrong,
    color: colors.primary,
    fontSize: 13.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
  },
  ticketSubject: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 2,
  },
  ticketMessage: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: spacing.xs,
  },
  ticketTime: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  estimatedResponseText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: "italic",
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: spacing.xl,
  },
});
