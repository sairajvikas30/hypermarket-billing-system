import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Bell, 
  Users, 
  Warehouse, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Languages,
  User as UserIcon,
  ShieldCheck,
  Info,
  FileText,
  Lock,
  ArrowLeft,
  Barcode,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  barcode: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
}

interface Customer {
  mobile: string;
  name: string;
  points: number;
  language: string;
}

interface Notification {
  id: string;
  message: string;
  date: string;
}

interface Order {
  id: string;
  barcode: string;
  name: string;
  quantity: number;
  status: string;
  deliveryTime: string;
}

interface AppSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  gstNumber: string;
  currency: string;
  taxPercentage: number;
  billHeader: string;
  billFooter: string;
  defaultLanguage: string;
}

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  className, 
  disabled,
  type = "button"
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: "primary" | "secondary" | "danger" | "ghost"; 
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  className,
  required = false
}: { 
  label?: string; 
  type?: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder?: string;
  className?: string;
  required?: boolean;
}) => (
  <div className={cn("flex flex-col gap-1.5 w-full", className)}>
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      required={required}
      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    />
  </div>
);

const Card = ({ children, className, key }: { children: React.ReactNode; className?: string; key?: React.Key }) => (
  <div key={key} className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm p-6", className)}>
    {children}
  </div>
);

// --- Auth Views ---

const AuthView = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    mobile: "",
    email: "",
    password: "",
    rePassword: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLogin && formData.password !== formData.rePassword) {
      setError("Passwords do not match");
      return;
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          onLogin(data.user);
        } else {
          setIsLogin(true);
          alert("Registration successful! Please login.");
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Connection error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShoppingCart className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hypermarket Billing</h1>
            <p className="text-gray-500 text-sm text-center">
              {isLogin ? "Welcome back! Please enter your details." : "Create an account to get started."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <>
                <Input 
                  label="Full Name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
                <div className="flex gap-4">
                  <Input 
                    label="Age" 
                    type="number" 
                    value={formData.age} 
                    onChange={e => setFormData({...formData, age: e.target.value})} 
                    required 
                  />
                  <Input 
                    label="Mobile No" 
                    value={formData.mobile} 
                    onChange={e => setFormData({...formData, mobile: e.target.value})} 
                    required 
                  />
                </div>
              </>
            )}
            <Input 
              label="Email Address" 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
            <Input 
              label="Password" 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
            {!isLogin && (
              <Input 
                label="Re-enter Password" 
                type="password" 
                value={formData.rePassword} 
                onChange={e => setFormData({...formData, rePassword: e.target.value})} 
                required 
              />
            )}

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <Button type="submit" className="w-full mt-2">
              {isLogin ? "Sign In" : "Register"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// --- Dashboard Views ---

const Dashboard = ({ user, onLogout, onNavigate }: { user: User, onLogout: () => void, onNavigate: (view: string) => void }) => {
  const menuItems = [
    { id: "start-billing", label: "Start Billing", icon: ShoppingCart, color: "bg-blue-500" },
    { id: "customer-billing", label: "Customer Billing", icon: Barcode, color: "bg-purple-500" },
    { id: "stock-details", label: "Stock Details", icon: Package, color: "bg-green-500" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "bg-amber-500" },
    { id: "customer-details", label: "Customer Details", icon: Users, color: "bg-indigo-500" },
    { id: "bills", label: "Bills", icon: Receipt, color: "bg-rose-500" },
    { id: "warehouse-details", label: "Warehouse Details", icon: Warehouse, color: "bg-emerald-500" },
    { id: "settings", label: "Settings", icon: Settings, color: "bg-gray-500" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hello, {user.name}</h1>
          <p className="text-gray-500">Welcome to the Hypermarket Management System</p>
        </div>
        <Button variant="ghost" onClick={onLogout} className="text-red-600 hover:bg-red-50">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-start p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6", item.color)}>
              <item.icon className="text-white w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{item.label}</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your {item.label.toLowerCase()} here</p>
            <div className="mt-4 text-blue-600 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ChevronRight className="w-4 h-4" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// --- Sub-Views ---

const BillingView = ({ mode, onBack }: { mode: "staff" | "customer", onBack: () => void }) => {
  const [items, setItems] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [hasChecked, setHasChecked] = useState(false);
  const [language, setLanguage] = useState("English");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "offline">("offline");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [finalBill, setFinalBill] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(setSettings);
  }, []);

  useEffect(() => {
    if (mode === "staff") {
      fetch("/api/stock")
        .then(res => res.json())
        .then(setAllProducts);
    }
  }, [mode]);

  const addItemByProduct = (product: Product) => {
    const existing = items.find(i => i.barcode === product.barcode);
    if (existing) {
      setItems(items.map(i => i.barcode === product.barcode ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { ...product, quantity: 1 }]);
    }
  };

  const addItem = async () => {
    if (!barcode) return;
    try {
      const res = await fetch(`/api/products/${barcode}`);
      if (res.ok) {
        const product = await res.json();
        const existing = items.find(i => i.barcode === barcode);
        if (existing) {
          setItems(items.map(i => i.barcode === barcode ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
          setItems([...items, { ...product, quantity: 1 }]);
        }
        setBarcode("");
      } else {
        alert("Product not found");
      }
    } catch (err) {
      alert("Error finding product");
    }
  };

  const checkCustomer = async () => {
    if (!customerMobile) return;
    try {
      const res = await fetch(`/api/customers/${customerMobile}`);
      setHasChecked(true);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
        setLanguage(data.language);
      } else {
        setCustomer(null);
        setCustomerName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerMobile,
          customerName,
          paymentMethod,
          language
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFinalBill(data.transaction);
        setShowReceipt(true);
      }
    } catch (err) {
      alert("Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxAmount = settings ? (subtotal * (settings.taxPercentage ?? 0)) / 100 : 0;
  const total = subtotal + taxAmount;

  const handleDone = () => {
    setCustomer(null);
    setCustomerMobile("");
    setCustomerName("");
    setHasChecked(false);
    setItems([]);
    setShowReceipt(false);
    setFinalBill(null);
    setBarcode("");
    setSearchQuery("");
  };

  const translations: Record<string, Record<string, string>> = {
    "English": {
      "Payment Successful": "Payment Successful",
      "Transaction ID": "Transaction ID",
      "Customer": "Customer",
      "Language": "Language",
      "Status": "Status",
      "Items": "Items",
      "Total": "Total",
      "Done": "Done",
      "Milk 1L": "Milk 1L",
      "Bread": "Bread",
      "Eggs 12pk": "Eggs 12pk",
      "Apple 1kg": "Apple 1kg",
      "Rice 5kg": "Rice 5kg",
      "Sugar 1kg": "Sugar 1kg",
      "Tea 250g": "Tea 250g",
      "Cooking Oil 1L": "Cooking Oil 1L",
      "Salt 1kg": "Salt 1kg",
      "Atta 5kg": "Atta 5kg",
      "Paid": "Paid",
      "Pending Cashier": "Pending Cashier",
      "Guest": "Guest"
    },
    "Hindi": {
      "Payment Successful": "भुगतान सफल रहा",
      "Transaction ID": "लेन-देन आईडी",
      "Customer": "ग्राहक",
      "Language": "भाषा",
      "Status": "स्थिति",
      "Items": "वस्तुएं",
      "Total": "कुल",
      "Done": "हो गया",
      "Milk 1L": "दूध 1 लीटर",
      "Bread": "ब्रेड",
      "Eggs 12pk": "अंडे 12 नग",
      "Apple 1kg": "सेब 1 किलो",
      "Rice 5kg": "चावल 5 किलो",
      "Sugar 1kg": "चीनी 1 किलो",
      "Tea 250g": "चाय 250 ग्राम",
      "Cooking Oil 1L": "खाना पकाने का तेल 1 लीटर",
      "Salt 1kg": "नमक 1 किलो",
      "Atta 5kg": "आटा 5 किलो",
      "Paid": "भुगतान किया गया",
      "Pending Cashier": "कैशियर लंबित",
      "Guest": "अतिथि"
    },
    "Tamil": {
      "Payment Successful": "பணம் செலுத்துதல் வெற்றி",
      "Transaction ID": "பரிவர்த்தனை ஐடி",
      "Customer": "வாடிக்கையாளர்",
      "Language": "மொழி",
      "Status": "நிலை",
      "Items": "பொருட்கள்",
      "Total": "மொத்தம்",
      "Done": "முடிந்தது",
      "Milk 1L": "பால் 1 லிட்டர்",
      "Bread": "ரொட்டி",
      "Eggs 12pk": "முட்டை 12 எண்ணிக்கை",
      "Apple 1kg": "ஆப்பிள் 1 கிலோ",
      "Rice 5kg": "அரிசி 5 கிலோ",
      "Sugar 1kg": "சர்க்கரை 1 கிலோ",
      "Tea 250g": "தேநீர் 250 கிராம்",
      "Cooking Oil 1L": "சமையல் எண்ணெய் 1 லிட்டர்",
      "Salt 1kg": "உப்பு 1 கிலோ",
      "Atta 5kg": "கோதுமை மாவு 5 கிலோ",
      "Paid": "செலுத்தப்பட்டது",
      "Pending Cashier": "காசாளர் நிலுவையில்",
      "Guest": "விருந்தினர்"
    },
    "Telugu": {
      "Payment Successful": "చెల్లింపు విజయవంతమైంది",
      "Transaction ID": "లావాదేవీ ఐడి",
      "Customer": "కస్టమర్",
      "Language": "భాష",
      "Status": "స్థితి",
      "Items": "వస్తువులు",
      "Total": "మొత్తం",
      "Done": "పూర్తయింది",
      "Milk 1L": "పాలు 1 లీటరు",
      "Bread": "బ్రెడ్",
      "Eggs 12pk": "గుడ్లు 12 ప్యాక్",
      "Apple 1kg": "ఆపిల్ 1 కిలో",
      "Rice 5kg": "బియ్యం 5 కిలోలు",
      "Sugar 1kg": "చక్కెర 1 కిలో",
      "Tea 250g": "టీ 250 గ్రాములు",
      "Cooking Oil 1L": "వంట నూనె 1 లీటరు",
      "Salt 1kg": "ఉప్పు 1 కిలో",
      "Atta 5kg": "గోధుమ పిండి 5 కిలోలు",
      "Paid": "చెల్లించబడింది",
      "Pending Cashier": "క్యాషియర్ పెండింగ్",
      "Guest": "అతిథి"
    },
    "Malayalam": {
      "Payment Successful": "പേയ്‌മെന്റ് വിജയിച്ചു",
      "Transaction ID": "ഇടപാട് ഐഡി",
      "Customer": "ഉപഭോക്താവ്",
      "Language": "ഭാഷ",
      "Status": "നില",
      "Items": "ഇനങ്ങൾ",
      "Total": "ആകെ",
      "Done": "പൂർത്തിയായി",
      "Milk 1L": "പാൽ 1 ലിറ്റർ",
      "Bread": "ബ്രെഡ്",
      "Eggs 12pk": "മുട്ട 12 എണ്ണം",
      "Apple 1kg": "ആപ്പിൾ 1 കിലോ",
      "Rice 5kg": "അരി 5 കിലോ",
      "Sugar 1kg": "പഞ്ചസാര 1 കിലോ",
      "Tea 250g": "ചായ 250 ഗ്രാം",
      "Cooking Oil 1L": "പാചക എണ്ണ 1 ലിറ്റർ",
      "Salt 1kg": "ഉപ്പ് 1 കിലോ",
      "Atta 5kg": "ആട്ട 5 കിലോ",
      "Paid": "അടച്ചു",
      "Pending Cashier": "കാഷ്യർ പെൻഡിംഗ്",
      "Guest": "അതിഥി"
    }
  };

  const t = (key: string) => {
    return translations[language]?.[key] || key;
  };

  if (showReceipt && settings) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="p-10 flex flex-col items-center">
          <div className="text-center mb-6">
            <h1 className="text-xl font-black uppercase tracking-tighter">{settings.storeName}</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{settings.storeAddress}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">GST: {settings.gstNumber}</p>
          </div>

          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t("Payment Successful")}</h2>
          <p className="text-gray-500 mb-8">{t("Transaction ID")}: {finalBill.id}</p>
          
          <div className="w-full border-t border-dashed border-gray-200 pt-6 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">{t("Customer")}</span>
              <div className="text-right">
                <p className="font-medium">{customer?.name || customerName || t("Guest")}</p>
                <p className="text-xs text-gray-400">{customerMobile}</p>
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">{t("Language")}</span>
              <span className="font-medium">{language}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">{t("Status")}</span>
              <span className={cn("font-bold", finalBill.status === "Paid" ? "text-green-600" : "text-amber-600")}>
                {t(finalBill.status)}
              </span>
            </div>
          </div>

          <div className="w-full space-y-3 mb-8">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">{t("Items")}</h3>
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{t(item.name)} x {item.quantity}</span>
                <span>{settings.currency}{Number(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{settings.currency}{Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax ({settings.taxPercentage}%)</span>
                <span>{settings.currency}{Number(taxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-2 border-t border-gray-100">
                <span>{t("Total")}</span>
                <span>{settings.currency}{Number(total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-sm font-medium text-gray-600 italic">{settings.billFooter}</p>
          </div>

          <Button onClick={handleDone} className="w-full">{t("Done")}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">{mode === "staff" ? "Staff Billing Terminal" : "Self-Checkout Terminal"}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {mode === "staff" && (
            <Card className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h3 className="font-bold text-xl text-gray-900">Quick Add Products</h3>
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search by name or scan barcode..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && searchQuery) {
                        const filtered = allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery));
                        if (filtered.length > 0) {
                          addItemByProduct(filtered[0]);
                          setSearchQuery("");
                        }
                      }
                    }}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg"
                  />
                </div>
              </div>
              <div className="max-h-[350px] overflow-y-auto border border-gray-100 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2">Barcode</th>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2 text-center">Price</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allProducts
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery))
                      .map((product) => (
                        <tr key={product.barcode} className="hover:bg-blue-50/50 transition-colors group">
                          <td className="px-4 py-2 font-mono text-xs text-gray-500">{product.barcode}</td>
                          <td className="px-4 py-2">
                            <span className="text-xs font-bold text-gray-900">{product.name}</span>
                          </td>
                          <td className="px-4 py-2 text-center text-xs font-bold text-blue-600">₹{product.price}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => addItemByProduct(product)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                              title="Add to bill"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {mode !== "staff" && (
            <Card className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addItem()}
                    placeholder="Scan or enter barcode..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <Button onClick={addItem} className="px-8">Add Item</Button>
              </div>
            </Card>
          )}

          <Card className="overflow-hidden p-0">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="divide-y divide-gray-50 min-h-[300px]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 gap-2">
                  <ShoppingCart className="w-12 h-12 opacity-20" />
                  <p>No items added yet</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={idx} className="px-6 py-4 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-1 text-gray-400 text-sm">{idx + 1}</div>
                    <div className="col-span-5">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{item.barcode}</p>
                    </div>
                    <div className="col-span-2 text-center text-gray-600">{settings?.currency || "₹"}{Number(item.price).toFixed(2)}</div>
                    <div className="col-span-2 flex items-center justify-center gap-3">
                      <button 
                        onClick={() => setItems(items.map(i => i.barcode === item.barcode ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => setItems(items.map(i => i.barcode === item.barcode ? { ...i, quantity: i.quantity + 1 } : i))}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="col-span-2 text-right font-bold text-gray-900">
                      {settings?.currency || "₹"}{Number(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-6">
            <h3 className="font-bold text-lg">Customer Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Mobile Number" 
                  value={customerMobile} 
                  onChange={e => {
                    setCustomerMobile(e.target.value);
                    setHasChecked(false);
                    setCustomer(null);
                  }} 
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-sm"
                />
                <Button variant="secondary" onClick={checkCustomer} className="shrink-0 px-3 py-2 text-sm h-[38px]">Check</Button>
              </div>
              
              {customer ? (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-600 font-bold uppercase">Returning Customer</p>
                  <p className="font-bold text-blue-900">{customer.name}</p>
                  <p className="text-sm text-blue-700">Points: {customer.points}</p>
                  <p className="text-sm text-blue-700">Language: {customer.language}</p>
                </div>
              ) : hasChecked && customerMobile ? (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs text-amber-600 font-bold uppercase">New Customer</p>
                    <p className="text-sm text-amber-700">Please provide details</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Customer Name</label>
                    <input 
                      type="text"
                      placeholder="Enter Name"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-sm"
                    />
                  </div>
                </div>
              ) : null}

              {(customer || hasChecked) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Languages className="w-4 h-4" /> Suggested Language
                  </label>
                  <select 
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                    <option>Telugu</option>
                    <option>Malayalam</option>
                  </select>
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-6">
            <h3 className="font-bold text-lg">Payment</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setPaymentMethod("offline")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  paymentMethod === "offline" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-400"
                )}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-sm font-bold">Cash</span>
              </button>
              <button 
                onClick={() => setPaymentMethod("online")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  paymentMethod === "online" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-400"
                )}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-sm font-bold">Online</span>
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{settings?.currency || "₹"}{Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax ({settings?.taxPercentage || 0}%)</span>
                <span>{settings?.currency || "₹"}{Number(taxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{settings?.currency || "₹"}{Number(total).toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={handleCheckout} 
              className="w-full py-4 text-lg"
              disabled={items.length === 0 || isProcessing}
            >
              {isProcessing ? "Processing..." : "Complete Checkout"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Bills View ---

const BillsView = ({ onBack }: { onBack: () => void }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"online" | "offline">("online");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(setSettings);
  }, []);

  useEffect(() => {
    fetch("/api/transactions")
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      });
  }, []);

  const filteredTransactions = transactions.filter(t => t.paymentMethod === activeTab);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Transaction History</h1>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab("online")}
          className={cn(
            "px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
            activeTab === "online" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-white text-gray-600 border border-gray-100"
          )}
        >
          <CreditCard className="w-5 h-5" />
          Online Payments
        </button>
        <button 
          onClick={() => setActiveTab("offline")}
          className={cn(
            "px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
            activeTab === "offline" ? "bg-green-600 text-white shadow-lg shadow-green-500/30" : "bg-white text-gray-600 border border-gray-100"
          )}
        >
          <Banknote className="w-5 h-5" />
          Cash Payments
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTransactions.length === 0 ? (
            <Card className="col-span-full py-12 flex flex-col items-center text-gray-400">
              <Receipt className="w-12 h-12 mb-4 opacity-20" />
              <p>No transactions found for this category</p>
            </Card>
          ) : (
            filteredTransactions.map((tx) => (
              <Card key={tx.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400 font-mono mb-1">{tx.id.slice(0, 8)}</p>
                    <p className="font-bold text-lg">{settings?.currency || "₹"}{Number(tx.total).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Customer</span>
                    <span className="font-medium">{tx.customerMobile || "Guest"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Items</span>
                    <span className="font-medium">{tx.items.length} items</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <div className="space-y-1">
                    {tx.items.slice(0, 2).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs text-gray-400">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{settings?.currency || "₹"}{Number(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {tx.items.length > 2 && (
                      <p className="text-[10px] text-gray-300 italic">+{tx.items.length - 2} more items</p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const StockView = ({ onBack }: { onBack: () => void }) => {
  const [stock, setStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [newProduct, setNewProduct] = useState({
    barcode: "",
    name: "",
    price: "",
    stock: "",
    minStock: "10"
  });

  const fetchStock = () => {
    fetch("/api/stock")
      .then(res => res.json())
      .then(data => {
        setStock(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStock();
    fetch("/api/settings")
      .then(res => res.json())
      .then(setSettings);
  }, []);

  const handleStockChange = async (barcode: string, change: number) => {
    try {
      const res = await fetch(`/api/stock/${barcode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change })
      });
      if (res.ok) {
        fetchStock();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewProduct({ barcode: "", name: "", price: "", stock: "", minStock: "10" });
        fetchStock();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Stock Inventory</h1>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-2">Barcode</div>
          <div className="col-span-4">Product Name</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Stock</div>
          <div className="col-span-2 text-center">Status</div>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading stock data...</div>
          ) : stock.map((item, idx) => (
            <div key={idx} className="px-6 py-4 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors">
              <div className="col-span-2 font-mono text-sm text-gray-500">{item.barcode}</div>
              <div className="col-span-4 font-bold text-gray-900">{item.name}</div>
              <div className="col-span-2 text-center text-gray-600">{settings?.currency || "₹"}{Number(item.price).toFixed(2)}</div>
              <div className="col-span-2 flex items-center justify-center gap-3">
                <button 
                  onClick={() => handleStockChange(item.barcode, -1)}
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className={cn(
                  "font-bold min-w-[2ch] text-center",
                  item.stock <= item.minStock ? "text-red-600" : "text-gray-900"
                )}>
                  {item.stock}
                </span>
                <button 
                  onClick={() => handleStockChange(item.barcode, 1)}
                  className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 text-blue-600 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="col-span-2 flex justify-center">
                {item.stock <= item.minStock ? (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded">Low Stock</span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-[10px] font-bold uppercase rounded">Healthy</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold">Add New Product</h2>
              </div>
              <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Barcode</label>
                  <Input 
                    required
                    value={newProduct.barcode}
                    onChange={e => setNewProduct({...newProduct, barcode: e.target.value})}
                    placeholder="Scan or type barcode"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Product Name</label>
                  <Input 
                    required
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="e.g. Fresh Milk"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Price (₹)</label>
                    <Input 
                      required
                      type="number"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Initial Stock</label>
                    <Input 
                      required
                      type="number"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Min Stock (Alert Level)</label>
                  <Input 
                    required
                    type="number"
                    value={newProduct.minStock}
                    onChange={e => setNewProduct({...newProduct, minStock: e.target.value})}
                    placeholder="10"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Product
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NotificationsView = ({ onBack }: { onBack: () => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(setNotifications);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="p-12 text-center text-gray-400">No new notifications</Card>
        ) : notifications.map((n) => (
          <Card key={n.id} className="p-4 flex gap-4 items-start">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              n.type === "critical" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
            )}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className={cn(
                "font-medium",
                n.type === "critical" ? "text-red-900" : "text-gray-900"
              )}>{n.message}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(n.date).toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CustomerDetailsView = ({ onBack }: { onBack: () => void }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(setCustomers);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Customer Database</h1>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Mobile</div>
          <div className="col-span-3 text-center">Points</div>
          <div className="col-span-3 text-center">Language</div>
        </div>
        <div className="divide-y divide-gray-100">
          {customers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No customers registered yet</div>
          ) : customers.map((c, idx) => (
            <div key={idx} className="px-6 py-4 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors">
              <div className="col-span-3 font-bold text-gray-900">{c.name}</div>
              <div className="col-span-3 text-gray-600">{c.mobile}</div>
              <div className="col-span-3 text-center font-bold text-blue-600">{c.points}</div>
              <div className="col-span-3 text-center">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{c.language}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const WarehouseView = ({ onBack }: { onBack: () => void }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/warehouse")
      .then(res => res.json())
      .then(setOrders);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Warehouse & Orders</h1>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-3">Order ID</div>
          <div className="col-span-3">Product</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-right">Delivery Time</div>
        </div>
        <div className="divide-y divide-gray-100">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No active warehouse orders</div>
          ) : orders.map((o, idx) => (
            <div key={idx} className="px-6 py-4 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors">
              <div className="col-span-3 font-mono text-xs text-gray-500">{o.id.slice(0, 8)}...</div>
              <div className="col-span-3 font-bold text-gray-900">{o.name}</div>
              <div className="col-span-2 text-center text-gray-600">{o.quantity}</div>
              <div className="col-span-2 text-center">
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold uppercase rounded">{o.status}</span>
              </div>
              <div className="col-span-2 text-right text-xs text-gray-500">
                {new Date(o.deliveryTime).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const SettingsView = ({ onBack }: { onBack: () => void }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(setSettings);
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Settings updated successfully");
      }
    } catch (err) {
      alert("Error updating settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password changed successfully");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error changing password");
    }
  };

  if (!settings) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Store Information */}
          <Card className="space-y-6">
            <div className="flex items-center gap-3 text-blue-600">
              <Info className="w-5 h-5" />
              <h3 className="font-bold">Store Information</h3>
            </div>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Store Name" 
                  value={settings.storeName || ""} 
                  onChange={e => setSettings({...settings, storeName: e.target.value})} 
                />
                <Input 
                  label="GST Number" 
                  value={settings.gstNumber || ""} 
                  onChange={e => setSettings({...settings, gstNumber: e.target.value})} 
                />
              </div>
              <Input 
                label="Store Address" 
                value={settings.storeAddress || ""} 
                onChange={e => setSettings({...settings, storeAddress: e.target.value})} 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Store Phone" 
                  value={settings.storePhone || ""} 
                  onChange={e => setSettings({...settings, storePhone: e.target.value})} 
                />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Default Language</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={settings.defaultLanguage || "English"}
                    onChange={e => setSettings({...settings, defaultLanguage: e.target.value})}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                    <option>Telugu</option>
                    <option>Malayalam</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex items-center gap-3 text-blue-600">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-bold">Tax & Currency</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Currency Symbol" 
                  value={settings.currency || ""} 
                  onChange={e => setSettings({...settings, currency: e.target.value})} 
                />
                <Input 
                  label="Tax Percentage (%)" 
                  type="number"
                  value={(settings.taxPercentage ?? 0).toString()} 
                  onChange={e => setSettings({...settings, taxPercentage: Number(e.target.value)})} 
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-3 text-blue-600">
                <Receipt className="w-5 h-5" />
                <h3 className="font-bold">Bill Customization</h3>
              </div>
              <Input 
                label="Bill Header Message" 
                value={settings.billHeader || ""} 
                onChange={e => setSettings({...settings, billHeader: e.target.value})} 
              />
              <Input 
                label="Bill Footer Message" 
                value={settings.billFooter || ""} 
                onChange={e => setSettings({...settings, billFooter: e.target.value})} 
              />

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save All Settings"}
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Security */}
          <Card className="space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold">Security</h3>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input 
                label="Old Password" 
                type="password" 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)} 
                required 
              />
              <Input 
                label="New Password" 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
              />
              <Input 
                label="Confirm New Password" 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
              <Button type="submit" variant="secondary" className="w-full">Update Password</Button>
            </form>
          </Card>

          {/* About */}
          <Card className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Info className="w-5 h-5" />
              <h3 className="font-bold">About App</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Hypermarket Billing System v1.2.0. A professional-grade solution for inventory, billing, and warehouse management.
            </p>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">© 2026 Hypermarket Solutions Inc.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setCurrentView("dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthView onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <AnimatePresence mode="wait">
        {currentView === "dashboard" && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Dashboard user={user} onLogout={handleLogout} onNavigate={setCurrentView} />
          </motion.div>
        )}
        {currentView === "start-billing" && (
          <motion.div 
            key="start-billing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <BillingView mode="staff" onBack={() => setCurrentView("dashboard")} />
          </motion.div>
        )}
        {currentView === "customer-billing" && (
          <motion.div 
            key="customer-billing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <BillingView mode="customer" onBack={() => setCurrentView("dashboard")} />
          </motion.div>
        )}
        {currentView === "stock-details" && (
          <motion.div 
            key="stock-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <StockView onBack={() => setCurrentView("dashboard")} />
          </motion.div>
        )}
        {currentView === "notifications" && (
          <motion.div 
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <NotificationsView onBack={() => setCurrentView("dashboard")} />
          </motion.div>
        )}
        {currentView === "customer-details" && (
          <motion.div 
            key="customer-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CustomerDetailsView onBack={() => setCurrentView("dashboard")} />
          </motion.div>
        )}
        {currentView === "warehouse-details" && (
          <motion.div 
            key="warehouse-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <WarehouseView onBack={() => setCurrentView("dashboard")} />
          </motion.div>
        )}
        {currentView === "settings" && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SettingsView onBack={() => setCurrentView("dashboard")} />
          </motion.div>
        )}
        {currentView === "bills" && (
          <motion.div 
            key="bills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BillsView onBack={() => setCurrentView("dashboard")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
