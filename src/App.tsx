import { useState, useMemo, type FormEvent } from 'react';
import {
  Package,
  ArrowDownToLine,
  ShoppingCart,
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Sun,
  Moon,
  ArrowRightLeft,
  Coins,
  Edit2,
  X,
  Edit3,
  Layers,
  Share2,
  Percent,
  Sparkles,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { usePersistedState } from './hooks/usePersistedState';

let idSeed = Date.now();
const generateId = () => ++idSeed;

interface CatalogItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  size: string;
  price: number;
  sellPrice: number;
  density: number;
  minLimit: number;
}

type OperationType = 'receive' | 'sell';

interface Transaction {
  id: number;
  type: OperationType;
  itemId: number;
  qty: number;
  price: number;
  date: Date;
}

interface Debt {
  id: number;
  customerName: string;
  phone: string;
  amount: number;
  originalAmount: number;
  itemName: string;
  date: string;
}

interface Receipt {
  id: number;
  itemName: string;
  qty: number;
  price: number;
  total: number;
  date: Date;
  unit: string;
  isNasiya: boolean;
}

type NotificationType = 'success' | 'error' | 'cash';

interface AppNotification {
  message: string;
  type: NotificationType;
}

type StockMap = Record<number, number>;

export default function App() {
  const [storeName, setStoreName] = usePersistedState('storeName', 'ТАХТА БОЗОР УЧЕТ');
  const [isEditingStoreName, setIsEditingStoreName] = useState(false);
  const [isDarkMode, setIsDarkMode] = usePersistedState('isDarkMode', true);
  const [activeTab, setActiveTab] = useState('stock');

  const [customCategories, setCustomCategories] = usePersistedState<string[]>('customCategories', ['Сосна', 'Дуб', 'Лиственница', 'Ясень', 'Фанера', 'ДСП', 'Брус', 'Доска']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [catalog, setCatalog] = usePersistedState<CatalogItem[]>('catalog', [
    { id: 1, name: 'Доска сосна обрезная 50x150x6000', category: 'Сосна', unit: 'м³', size: '50x150x6000', price: 120, sellPrice: 165, density: 500, minLimit: 20 },
    { id: 2, name: 'Брус дубовый строганный 100x100x6000', category: 'Дуб', unit: 'шт', size: '100x100x6000', price: 450, sellPrice: 580, density: 750, minLimit: 15 },
    { id: 3, name: 'Рейка лиственница 25x50x3000', category: 'Лиственница', unit: 'шт', size: '25x50x3000', price: 35, sellPrice: 52, density: 650, minLimit: 50 },
    { id: 4, name: 'Фанера влагостойкая 18мм', category: 'Фанера', unit: 'лист', size: '1525x1525', price: 150, sellPrice: 198, density: 600, minLimit: 10 },
  ]);

  const [stock, setStock] = usePersistedState<StockMap>('stock', {
    1: 15, // Мало сосны на складе (в дефиците)
    2: 70,
    3: 210,
    4: 12,
  });

  const [debts, setDebts] = usePersistedState<Debt[]>('debts', [
    { id: 1, customerName: 'Алишер Ака', phone: '+992900000000', amount: 1500, originalAmount: 3000, itemName: 'Брус дубовый', date: '12.07.2026' },
    { id: 2, customerName: 'Фирдавс Строй', phone: '+992931112233', amount: 520, originalAmount: 520, itemName: 'Рейка лиственница', date: '14.07.2026' },
  ]);

  const [isNasiyaSale, setIsNasiyaSale] = useState(false);
  const [nasiyaName, setNasiyaName] = useState('');
  const [nasiyaPhone, setNasiyaPhone] = useState('');

  const [activePaymentDebtId, setActivePaymentDebtId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [transactions, setTransactions] = usePersistedState<Transaction[]>(
    'transactions',
    [
      { id: 101, type: 'receive', itemId: 1, qty: 15, price: 120, date: new Date(Date.now() - 3600000 * 5) },
      { id: 102, type: 'sell', itemId: 1, qty: 3, price: 165, date: new Date(Date.now() - 3600000 * 3) },
      { id: 103, type: 'receive', itemId: 4, qty: 12, price: 150, date: new Date(Date.now() - 3600000 * 2) },
    ],
    (raw) => (raw as (Omit<Transaction, 'date'> & { date: string })[]).map(t => ({ ...t, date: new Date(t.date) }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<AppNotification | null>(null);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Сосна');
  const [newItemUnit, setNewItemUnit] = useState('шт');
  const [newItemSize, setNewItemSize] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemSellPrice, setNewItemSellPrice] = useState('');
  const [newItemDensity, setNewItemDensity] = useState('600');
  const [newItemMinLimit, setNewItemMinLimit] = useState('10');

  const [editingCatalogId, setEditingCatalogId] = useState<number | null>(null);
  const [editCatalogName, setEditCatalogName] = useState('');
  const [editCatalogCategory, setEditCatalogCategory] = useState('');
  const [editCatalogUnit, setEditCatalogUnit] = useState('шт');
  const [editCatalogSize, setEditCatalogSize] = useState('');
  const [editCatalogPrice, setEditCatalogPrice] = useState('');
  const [editCatalogSellPrice, setEditCatalogSellPrice] = useState('');
  const [editCatalogMinLimit, setEditCatalogMinLimit] = useState('');
  const [editCatalogDensity, setEditCatalogDensity] = useState('');

  const [opType, setOpType] = useState<OperationType>('receive');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [opQty, setOpQty] = useState('');
  const [opCustomPrice, setOpCustomPrice] = useState('');

  const [calcHeight, setCalcHeight] = useState('50'); 
  const [calcWidth, setCalcWidth] = useState('150'); 
  const [calcLength, setCalcLength] = useState('6000'); 
  const [calcPieces, setCalcPieces] = useState('10');

  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  const [editingTxId, setEditingTxId] = useState<number | null>(null);
  const [editTxQty, setEditTxQty] = useState('');
  const [editTxPrice, setEditTxPrice] = useState('');

  const playSound = (type: NotificationType) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); 
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'cash') { 
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {
      // Audio autoplay policy guard
    }
  };

  const showNotification = (message: string, type: NotificationType = 'success') => {
    setNotification({ message, type });
    playSound(type);
    setTimeout(() => setNotification(null), 3500);
  };

  const totalStockValue = useMemo(() => {
    return catalog.reduce((sum, item) => {
      const qty = stock[item.id] || 0;
      return sum + (qty * (item.price || 0));
    }, 0);
  }, [catalog, stock]);

  const totalActiveDebts = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.amount, 0);
  }, [debts]);

  const financialStats = useMemo(() => {
    const now = new Date();
    let salesToday = 0;
    let profitToday = 0;
    transactions.forEach(tx => {
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
      const isToday = txDate.getFullYear() === now.getFullYear() &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getDate() === now.getDate();
      if (!isToday) return;

      const item = catalog.find(i => i.id === tx.itemId);
      const cost = item ? item.price : tx.price;
      if (tx.type === 'sell') {
        salesToday += tx.qty * tx.price;
        profitToday += tx.qty * (tx.price - cost);
      }
    });
    return { sales: salesToday, profit: profitToday };
  }, [transactions, catalog]);

  const allCategoriesFilter = useMemo(() => {
    return ['All', ...customCategories];
  }, [customCategories]);

  const woodPhysics = useMemo(() => {
    const h = (Number(calcHeight) || 0) / 1000;
    const w = (Number(calcWidth) || 0) / 1000;
    const l = (Number(calcLength) || 0) / 1000;
    const pcs = Number(calcPieces) || 0;
    
    const volume = h * w * l * pcs; 
    const selectedItem = catalog.find(i => i.id === Number(selectedItemId));
    const density = selectedItem?.density || 600; 
    const weight = volume * density; 

    return {
      volume: volume.toFixed(4),
      weight: weight.toFixed(1)
    };
  }, [calcHeight, calcWidth, calcLength, calcPieces, selectedItemId, catalog]);

  const handleCreateCategory = (e: FormEvent) => {
    e.preventDefault();
    const formatted = newCategoryName.trim();
    if (!formatted) return;

    if (customCategories.some(cat => cat.toLowerCase() === formatted.toLowerCase())) {
      showNotification('Категория уже существует', 'error');
      return;
    }

    setCustomCategories([...customCategories, formatted]);
    setNewCategoryName('');
    showNotification('Категория успешно создана!');
  };

  const handleCreateProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || !newItemSellPrice) {
      showNotification('Заполните обязательные поля!', 'error');
      return;
    }

    const newId = generateId();
    const newProduct = {
      id: newId,
      name: newItemName,
      category: newItemCategory,
      unit: newItemUnit,
      size: newItemSize || '—',
      price: Number(newItemPrice),
      sellPrice: Number(newItemSellPrice),
      density: Number(newItemDensity) || 600,
      minLimit: Number(newItemMinLimit) || 10
    };

    setCatalog([...catalog, newProduct]);
    setStock(prev => ({ ...prev, [newId]: 0 }));
    
    setNewItemName('');
    setNewItemSize('');
    setNewItemPrice('');
    setNewItemSellPrice('');
    showNotification('Новый вид лесоматериала добавлен!');
  };

  const handleExecuteOperation = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !opQty || isNaN(Number(opQty)) || Number(opQty) <= 0) {
      showNotification('Введите корректное количество', 'error');
      return;
    }

    const targetId = Number(selectedItemId);
    const qty = Number(opQty);
    const product = catalog.find(p => p.id === targetId);
    if (!product) return;

    const currentQty = stock[targetId] || 0;
    const priceToApply = opCustomPrice ? Number(opCustomPrice) : (opType === 'receive' ? product.price : product.sellPrice);

    if (opType === 'sell' && currentQty < qty) {
      showNotification(`Недостаточно остатка! На складе: ${currentQty} ${product.unit}`, 'error');
      return;
    }

    if (opType === 'sell' && isNasiyaSale) {
      if (!nasiyaName.trim()) {
        showNotification('Укажите имя должника!', 'error');
        return;
      }
    }

    const updatedQty = opType === 'receive' ? currentQty + qty : currentQty - qty;
    setStock(prev => ({ ...prev, [targetId]: updatedQty }));

    const txId = generateId();
    const newTx = {
      id: txId,
      type: opType,
      itemId: targetId,
      qty: qty,
      price: priceToApply,
      date: new Date()
    };
    setTransactions([newTx, ...transactions]);

    if (opType === 'sell' && isNasiyaSale) {
      const totalCost = qty * priceToApply;
      const newDebt = {
        id: generateId(),
        customerName: nasiyaName,
        phone: nasiyaPhone || '—',
        amount: totalCost,
        originalAmount: totalCost,
        itemName: product.name,
        date: new Date().toLocaleDateString('ru-RU')
      };
      setDebts([newDebt, ...debts]);
      setNasiyaName('');
      setNasiyaPhone('');
      setIsNasiyaSale(false);
    }

    if (opType === 'sell') {
      setActiveReceipt({
        id: txId,
        itemName: product.name,
        qty,
        price: priceToApply,
        total: qty * priceToApply,
        date: new Date(),
        unit: product.unit,
        isNasiya: isNasiyaSale
      });
    }

    setOpQty('');
    setOpCustomPrice('');
    setSelectedItemId('');
    showNotification(opType === 'receive' ? 'Приход оформлен!' : 'Продажа оформлена успешно!');
    if (opType === 'receive') {
      setActiveTab('stock');
    }
  };

  const handlePayDebt = (id: number) => {
    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      showNotification('Укажите верную сумму!', 'error');
      return;
    }

    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        if (amt > d.amount) {
          showNotification('Сумма превышает долг!', 'error');
          return d;
        }
        const updatedAmt = d.amount - amt;
        showNotification(updatedAmt === 0 ? 'Долг погашен полностью!' : 'Часть долга оплачена!', 'cash');
        return { ...d, amount: updatedAmt };
      }
      return d;
    }).filter(d => d.amount > 0));

    setActivePaymentDebtId(null);
    setPaymentAmount('');
  };

  const handleShareReceipt = async (receipt: Receipt) => {
    const lines = [
      storeName,
      'КВИТАНЦИЯ ОБ ОПЛАТЕ',
      '',
      `Товар: ${receipt.itemName}`,
      `Количество: ${receipt.qty} ${receipt.unit}`,
      receipt.isNasiya ? 'ТИП СДЕЛКИ: НАСИЯ (ДОЛГ)' : null,
      `ИТОГО: ${receipt.total.toLocaleString('ru-RU')} смн`,
      new Date(receipt.date).toLocaleString('ru-RU'),
    ].filter(Boolean);
    const text = lines.join('\n');

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Квитанция', text });
        showNotification('Квитанция отправлена!');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showNotification('Чек скопирован в буфер обмена!');
      } else {
        showNotification('Обмен не поддерживается в этом браузере', 'error');
        return;
      }
    } catch (e) {
      const name = e instanceof Error ? e.name : undefined;
      if (name !== 'AbortError') {
        showNotification('Не удалось поделиться чеком', 'error');
      }
      return;
    }

    setActiveReceipt(null);
  };

  const handleSendReminder = (debt: Debt) => {
    const text = `Салом, ${debt.customerName}! 🤝 Аз пойгоҳи чӯбу тахтаи «Тахта Бозор» ба Шумо муроҷиат мекунем. Боқимондаи қарзи Шумо (Насия) барои "${debt.itemName}": ${debt.amount} сомонӣ мебошад. Саломат бошед!`;
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${debt.phone.replace(/[^0-9]/g, '')}?text=${encodedText}`;
    window.open(url, '_blank');
    showNotification('Текст напоминания сгенерирован!');
  };

  const handleSaveCatalogEdit = (id: number) => {
    if (!editCatalogName.trim() || !editCatalogPrice || !editCatalogSellPrice) {
      showNotification('Заполните поля!', 'error');
      return;
    }

    setCatalog(catalog.map(item => 
      item.id === id 
        ? {
            ...item,
            name: editCatalogName,
            category: editCatalogCategory,
            unit: editCatalogUnit,
            size: editCatalogSize,
            price: Number(editCatalogPrice),
            sellPrice: Number(editCatalogSellPrice),
            minLimit: Number(editCatalogMinLimit) || 10,
            density: Number(editCatalogDensity) || 600
          }
        : item
    ));

    setEditingCatalogId(null);
    showNotification('Параметры успешно обновлены!');
  };

  const handleDeleteFromCatalog = (id: number) => {
    if (stock[id] > 0) {
      showNotification('Товар есть на складе! Удаление запрещено.', 'error');
      return;
    }
    const item = catalog.find(i => i.id === id);
    if (!window.confirm(`Удалить «${item?.name ?? 'товар'}» из каталога? Это действие нельзя отменить.`)) {
      return;
    }
    setCatalog(catalog.filter(item => item.id !== id));
    showNotification('Товар удален из каталога');
  };

  const handleCancelTransaction = (txId: number) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    if (!window.confirm('Отменить эту операцию? Остатки на складе будут пересчитаны.')) {
      return;
    }

    const currentQty = stock[tx.itemId] || 0;
    let restoredQty = currentQty;

    if (tx.type === 'receive') {
      if (currentQty < tx.qty) {
        showNotification('Товар с этого прихода уже продан!', 'error');
        return;
      }
      restoredQty -= tx.qty;
    } else {
      restoredQty += tx.qty;
    }

    setStock(prev => ({ ...prev, [tx.itemId]: restoredQty }));
    setTransactions(prev => prev.filter(t => t.id !== txId));
    showNotification('Операция успешно отменена!');
  };

  const handleSaveTransactionEdit = (txId: number) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    const newQty = Number(editTxQty);
    const newPrice = Number(editTxPrice);

    if (isNaN(newQty) || newQty <= 0 || isNaN(newPrice) || newPrice <= 0) {
      showNotification('Укажите верные числа!', 'error');
      return;
    }

    const currentStockQty = stock[tx.itemId] || 0;
    const diff = newQty - tx.qty;
    let updatedStockQty = currentStockQty;

    if (tx.type === 'receive') {
      if (currentStockQty + diff < 0) {
        showNotification('Недостаточно товара на складе для уменьшения прихода!', 'error');
        return;
      }
      updatedStockQty += diff;
    } else if (tx.type === 'sell') {
      if (currentStockQty - diff < 0) {
        showNotification('Недостаточно товара на складе для увеличения продажи!', 'error');
        return;
      }
      updatedStockQty -= diff;
    }

    setStock(prev => ({ ...prev, [tx.itemId]: updatedStockQty }));
    setTransactions(prev => prev.map(t => 
      t.id === txId ? { ...t, qty: newQty, price: newPrice } : t
    ));

    setEditingTxId(null);
    showNotification('Журнал обновлен и остатки пересчитаны!');
  };

  const renderStock = () => {
    const filteredCatalog = catalog.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.price.toString().includes(searchQuery);
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });

    return (
      <div className="space-y-4 animate-in fade-in">
        {/* Карточка суммарных ресурсов */}
        <div className="bg-gradient-to-br from-zinc-900 via-neutral-950 to-zinc-900 border border-zinc-800 p-4 rounded-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Coins className="w-16 h-16 text-orange-500" />
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Баланс всего склада
            </span>
            <span className="text-[10px] font-bold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-md border border-orange-500/20">
              Сомони
            </span>
          </div>
          <p className="text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
            {totalStockValue.toLocaleString('ru-RU')} <span className="text-xs font-sans font-normal text-zinc-400">смн</span>
          </p>
          
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-800/80 text-xs">
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-bold">Активная Насия (Долги):</p>
              <p className="font-mono font-bold text-red-400">+{totalActiveDebts.toLocaleString('ru-RU')} смн</p>
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-bold">Прибыль сегодня:</p>
              <p className="font-mono font-bold text-emerald-400">+{financialStats.profit.toLocaleString('ru-RU')} смн</p>
            </div>
          </div>
        </div>

        {/* Поиск */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Поиск по доске, брусу..." 
            className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30 text-zinc-100 text-sm font-medium placeholder:text-zinc-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Быстрые теги */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {allCategoriesFilter.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}
            >
              {cat === 'All' ? 'Все породы' : cat}
            </button>
          ))}
        </div>

        {/* Остатки склада */}
        <div className="space-y-2.5">
          {filteredCatalog.map(item => {
            const qty = stock[item.id] || 0;
            const isDeficit = qty <= item.minLimit;

            return (
              <div 
                key={item.id} 
                className={`bg-zinc-900 border p-3.5 rounded-xl flex justify-between items-center transition-all ${
                  isDeficit ? 'border-red-500/40' : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-1 max-w-[65%]">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    {isDeficit && (
                      <span className="text-[9px] font-extrabold text-red-400 uppercase tracking-widest bg-red-500/10 px-2 rounded-md animate-pulse">
                        Мало!
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-zinc-100 text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-zinc-500">Закуп: {item.price} смн • Продажа: {item.sellPrice} смн</p>
                </div>
                <div className="text-right">
                  <span className={`text-base font-mono font-black ${isDeficit ? 'text-red-400' : 'text-zinc-100'}`}>
                    {qty} <span className="text-xs font-normal text-zinc-500">{item.unit}</span>
                  </span>
                  <p className="text-[10px] font-mono text-orange-400 font-bold mt-1">
                    { (qty * item.price).toLocaleString('ru-RU') } смн
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOperations = () => {
    const selectedItem = catalog.find(i => i.id === Number(selectedItemId));
    const profitMargin = selectedItem ? ((selectedItem.sellPrice - selectedItem.price) / selectedItem.sellPrice * 100).toFixed(0) : 0;

    return (
      <div className="space-y-4 animate-in fade-in pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-zinc-100">Регистрация сделки</h2>
        </div>

        {/* Переключатель */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button 
            type="button"
            onClick={() => setOpType('receive')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all ${opType === 'receive' ? 'bg-orange-500 text-white shadow' : 'text-zinc-500'}`}
          >
            Принять (+)
          </button>
          <button 
            type="button"
            onClick={() => setOpType('sell')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all ${opType === 'sell' ? 'bg-blue-500 text-white shadow' : 'text-zinc-500'}`}
          >
            Продать (-)
          </button>
        </div>

        <form onSubmit={handleExecuteOperation} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Товар</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full p-2.5 bg-black border border-zinc-850 rounded-lg text-sm text-zinc-200 outline-none focus:ring-1 focus:ring-orange-500/20"
            >
              <option value="" disabled>-- Выберите дерево/доску --</option>
              {catalog.map(item => {
                const qty = stock[item.id] || 0;
                return (
                  <option key={item.id} value={item.id} disabled={opType === 'sell' && qty === 0}>
                    {item.name} ({qty} {item.unit} на складе)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Быстрый математический калькулятор */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Калькулятор кубов</p>
              <span className="text-[10px] font-mono text-zinc-400">Вес партии: {woodPhysics.weight} кг</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div>
                <label className="block text-[9px] text-zinc-500 mb-0.5">Толщ(мм)</label>
                <input type="number" placeholder="50" value={calcHeight} onChange={e=>setCalcHeight(e.target.value)} className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200" />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-500 mb-0.5">Шир(мм)</label>
                <input type="number" placeholder="150" value={calcWidth} onChange={e=>setCalcWidth(e.target.value)} className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200" />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-500 mb-0.5">Длина(мм)</label>
                <input type="number" placeholder="6000" value={calcLength} onChange={e=>setCalcLength(e.target.value)} className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200" />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-500 mb-0.5">Штук</label>
                <input type="number" placeholder="10" value={calcPieces} onChange={e=>setCalcPieces(e.target.value)} className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200" />
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-900 pt-2 text-xs">
              <span className="text-zinc-400">Объем: <strong className="text-orange-400 font-mono">{woodPhysics.volume} м³</strong></span>
              <button
                type="button"
                onClick={() => {
                  setOpQty(woodPhysics.volume);
                  showNotification('Кубатура вставлена!');
                }}
                className="px-2.5 py-1 bg-orange-500 text-white text-[10px] font-bold rounded"
              >
                Вставить в объем
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Количество ({selectedItem?.unit || 'ед.'})</label>
            <input
              type="number"
              step="any"
              placeholder="0.000"
              value={opQty}
              onChange={(e) => setOpQty(e.target.value)}
              className="w-full p-2.5 bg-black border border-zinc-850 rounded-lg text-sm font-mono text-zinc-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Своя цена (сомони за ед.)</label>
            <input
              type="number"
              placeholder="Использовать цену из базы"
              value={opCustomPrice}
              onChange={(e) => setOpCustomPrice(e.target.value)}
              className="w-full p-2.5 bg-black border border-zinc-850 rounded-lg text-sm font-mono text-zinc-100 outline-none"
            />
          </div>

          {opType === 'sell' && selectedItem && (
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 flex justify-between items-center text-xs">
              <span className="text-zinc-500 uppercase text-[9px] font-bold">Маржа:</span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                <Percent className="w-3.5 h-3.5" /> {profitMargin}% ({selectedItem.sellPrice - selectedItem.price} смн)
              </span>
            </div>
          )}

          {/* НАСТРОЙКА ДОЛГА (НАСИЯ) */}
          {opType === 'sell' && (
            <div className="border-t border-zinc-850 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-zinc-300">Оформить в долг (НАСИЯ)</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={isNasiyaSale} 
                  onChange={(e) => setIsNasiyaSale(e.target.checked)} 
                  className="w-4 h-4 rounded bg-black border-zinc-800 text-orange-500"
                />
              </div>

              {isNasiyaSale && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <input 
                    type="text" 
                    placeholder="Имя клиента (напр. Алишер Ака)" 
                    value={nasiyaName} 
                    onChange={e => setNasiyaName(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-850 rounded-lg text-xs text-zinc-200"
                  />
                  <input 
                    type="text" 
                    placeholder="Телефон (напр. +992900000000)" 
                    value={nasiyaPhone} 
                    onChange={e => setNasiyaPhone(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-850 rounded-lg text-xs text-zinc-200 font-mono"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-all ${
              opType === 'receive' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {opType === 'receive' ? 'Зачислить на склад (+)' : 'Отпустить со склада (-)'}
          </button>
        </form>

        {/* Чек */}
        {activeReceipt && (
          <div className="bg-white text-zinc-950 p-4 rounded-xl border-2 border-dashed border-zinc-300 shadow-2xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider">{storeName}</h4>
                <p className="text-[9px] text-zinc-500">КВИТАНЦИЯ ОБ ОПЛАТЕ</p>
              </div>
              <button onClick={() => setActiveReceipt(null)}>
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <div className="border-t border-zinc-200 pt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Товар:</span>
                <span className="font-bold">{activeReceipt.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span>Количество:</span>
                <span className="font-mono font-bold">{activeReceipt.qty} {activeReceipt.unit}</span>
              </div>
              {activeReceipt.isNasiya && (
                <div className="flex justify-between text-red-500">
                  <span className="font-bold">ТИП СДЕЛКИ:</span>
                  <span className="font-bold uppercase">НАСИЯ (ДОЛГ)</span>
                </div>
              )}
              <div className="flex justify-between border-t border-dashed border-zinc-200 pt-2 text-sm">
                <span className="font-extrabold">ИТОГО:</span>
                <span className="font-mono font-black text-blue-600">{activeReceipt.total.toLocaleString('ru-RU')} смн</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleShareReceipt(activeReceipt)}
              className="w-full py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> Поделиться квитанцией
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDebts = () => {
    return (
      <div className="space-y-4 animate-in fade-in pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-zinc-100">Учет долгов (НАСИЯ)</h2>
        </div>

        {debts.length === 0 ? (
          <div className="text-center py-8 border border-zinc-800 rounded-xl bg-zinc-900/40">
            <UserCheck className="w-8 h-8 mx-auto text-zinc-700 mb-1" />
            <p className="text-xs text-zinc-500">Нет активных долгов</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {debts.map(debt => {
              const isPaymentFormOpen = activePaymentDebtId === debt.id;
              const progress = ((debt.originalAmount - debt.amount) / debt.originalAmount) * 100;

              return (
                <div key={debt.id} className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-zinc-100 text-sm">{debt.customerName}</h4>
                      <p className="text-xs text-zinc-500 font-mono">{debt.phone}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Товар: <span className="font-bold">{debt.itemName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-black text-red-400">{debt.amount} смн</p>
                      <p className="text-[9px] text-zinc-500">из {debt.originalAmount} смн</p>
                    </div>
                  </div>

                  <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${progress}%` }} />
                  </div>

                  {isPaymentFormOpen ? (
                    <div className="p-2 bg-zinc-950 rounded border border-zinc-850 space-y-2">
                      <div className="flex gap-1.5">
                        <input 
                          type="number" 
                          placeholder="Сумма сомони" 
                          value={paymentAmount}
                          onChange={e => setPaymentAmount(e.target.value)}
                          className="flex-1 p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200"
                        />
                        <button
                          type="button"
                          onClick={() => handlePayDebt(debt.id)}
                          className="px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold"
                        >
                          Внести
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePaymentDebtId(null)}
                          className="px-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 pt-1 border-t border-zinc-850">
                      <button
                        onClick={() => {
                          setActivePaymentDebtId(debt.id);
                          setPaymentAmount(debt.amount.toString());
                        }}
                        className="flex-1 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-lg text-xs font-bold"
                      >
                        Оплатить долг
                      </button>
                      <button
                        onClick={() => handleSendReminder(debt)}
                        className="px-3 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/10 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Напомнить
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderDatabase = () => {
    return (
      <div className="space-y-4 animate-in fade-in pb-12">
        <h2 className="text-base font-bold text-zinc-100">База видов дерева</h2>

        {/* Создать категорию */}
        <form onSubmit={handleCreateCategory} className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-orange-500">
            <Layers className="w-4 h-4" />
            <p className="text-xs font-bold uppercase tracking-wider">Создать породу/категорию</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Напр. Арча, Орех, Ясень"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg text-xs text-zinc-200 outline-none"
            />
            <button
              type="submit"
              className="px-3.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Создать товар */}
        <form onSubmit={handleCreateProduct} className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Создать карточку дерева</p>
          
          <input 
            type="text" 
            placeholder="Название (напр. Брус сосновый 100х100)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs"
          />

          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" 
              placeholder="Размер (напр. 50x150x6000)"
              value={newItemSize}
              onChange={(e) => setNewItemSize(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-zinc-400"
            >
              {customCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="Закуп (сомони)"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono"
            />
            <input 
              type="number" 
              placeholder="Продажа (сомони)"
              value={newItemSellPrice}
              onChange={(e) => setNewItemSellPrice(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="Лимит дефицита"
              value={newItemMinLimit}
              onChange={(e) => setNewItemMinLimit(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono"
            />
            <select
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-zinc-400"
            >
              <option value="шт">Шт.</option>
              <option value="м³">Куб. м (м³)</option>
              <option value="м²">Кв. м (м²)</option>
              <option value="лист">Лист</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-zinc-500 mb-0.5">Плотность (кг/м³, для расчёта веса)</label>
            <input
              type="number"
              placeholder="600"
              value={newItemDensity}
              onChange={(e) => setNewItemDensity(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg"
          >
            Сохранить в базу
          </button>
        </form>

        {/* Список товаров */}
        <div className="space-y-2">
          {catalog.map(item => {
            const isEditing = editingCatalogId === item.id;
            
            if (isEditing) {
              return (
                <div key={item.id} className="bg-zinc-900 border border-orange-500 p-3.5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center pb-1 border-b border-zinc-850">
                    <span className="text-xs font-bold text-orange-500">Редактирование</span>
                    <button onClick={() => setEditingCatalogId(null)}><X className="w-4 h-4 text-zinc-400" /></button>
                  </div>
                  <input 
                    type="text" 
                    value={editCatalogName}
                    onChange={(e) => setEditCatalogName(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-zinc-200"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={editCatalogSize}
                      onChange={(e) => setEditCatalogSize(e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-zinc-200"
                    />
                    <select
                      value={editCatalogCategory}
                      onChange={(e) => setEditCatalogCategory(e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-zinc-200"
                    >
                      {customCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-0.5">Закуп (смн)</label>
                      <input
                        type="number"
                        value={editCatalogPrice}
                        onChange={(e) => setEditCatalogPrice(e.target.value)}
                        className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-0.5">Продажа (смн)</label>
                      <input
                        type="number"
                        value={editCatalogSellPrice}
                        onChange={(e) => setEditCatalogSellPrice(e.target.value)}
                        className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-0.5">Ед. изм.</label>
                      <select
                        value={editCatalogUnit}
                        onChange={(e) => setEditCatalogUnit(e.target.value)}
                        className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-zinc-200"
                      >
                        <option value="шт">Шт.</option>
                        <option value="м³">м³</option>
                        <option value="м²">м²</option>
                        <option value="лист">Лист</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-0.5">Лимит дефицита</label>
                      <input
                        type="number"
                        value={editCatalogMinLimit}
                        onChange={(e) => setEditCatalogMinLimit(e.target.value)}
                        className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-0.5">Плотность кг/м³</label>
                      <input
                        type="number"
                        value={editCatalogDensity}
                        onChange={(e) => setEditCatalogDensity(e.target.value)}
                        className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveCatalogEdit(item.id)}
                    className="w-full py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    Применить
                  </button>
                </div>
              );
            }

            return (
              <div key={item.id} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-zinc-200 text-xs">{item.name}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Порода: <span className="font-bold text-orange-500">{item.category}</span> • Размер: {item.size}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Закуп: {item.price} смн • Розница: {item.sellPrice} смн
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      setEditingCatalogId(item.id);
                      setEditCatalogName(item.name);
                      setEditCatalogCategory(item.category);
                      setEditCatalogUnit(item.unit);
                      setEditCatalogSize(item.size);
                      setEditCatalogPrice(item.price.toString());
                      setEditCatalogSellPrice(item.sellPrice.toString());
                      setEditCatalogMinLimit(item.minLimit.toString());
                      setEditCatalogDensity((item.density || 600).toString());
                    }}
                    className="p-1.5 text-zinc-400 hover:text-orange-500 rounded-md"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteFromCatalog(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    return (
      <div className="space-y-4 animate-in fade-in pb-12">
        <h2 className="text-base font-bold text-zinc-100">Журнал операций</h2>
        
        {transactions.length === 0 ? (
          <p className="text-center py-8 text-xs text-zinc-500">История пуста</p>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => {
              const item = catalog.find(c => c.id === tx.itemId);
              const itemName = item ? item.name : 'Позиция удалена';
              const isReceive = tx.type === 'receive';
              const isEditing = editingTxId === tx.id;

              if (isEditing) {
                return (
                  <div key={tx.id} className="bg-zinc-900 border border-orange-500 p-3.5 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-orange-500">Редактирование операции ({isReceive ? 'Приход' : 'Продажа'}):</p>
                    <p className="text-xs font-semibold text-zinc-200">{itemName}</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-0.5">Количество</label>
                        <input
                          type="number"
                          step="any"
                          value={editTxQty}
                          onChange={(e) => setEditTxQty(e.target.value)}
                          className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-0.5">Цена (смн)</label>
                        <input
                          type="number"
                          step="any"
                          value={editTxPrice}
                          onChange={(e) => setEditTxPrice(e.target.value)}
                          className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <button 
                        onClick={() => handleSaveTransactionEdit(tx.id)}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-[11px] font-bold rounded"
                      >
                        Применить
                      </button>
                      <button 
                        onClick={() => setEditingTxId(null)}
                        className="px-3 py-1.5 bg-zinc-850 text-zinc-400 text-[11px] font-bold rounded"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={tx.id} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isReceive ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {isReceive ? <ArrowDownToLine className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-zinc-200 text-xs max-w-[150px] truncate leading-tight">
                        {itemName}
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {tx.price.toLocaleString('ru-RU')} сомони • {new Date(tx.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold text-xs mr-1.5 ${isReceive ? 'text-orange-500' : 'text-blue-500'}`}>
                      {isReceive ? '+' : '-'}{tx.qty} {item ? item.unit : ''}
                    </span>
                    
                    <div className="flex flex-col gap-0.5 border-l border-zinc-800 pl-1.5">
                      <button 
                        onClick={() => {
                          setEditingTxId(tx.id);
                          setEditTxQty(tx.qty.toString());
                          setEditTxPrice(tx.price.toString());
                        }}
                        className="p-1 text-zinc-500 hover:text-orange-500"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleCancelTransaction(tx.id)} 
                        className="p-1 text-zinc-500 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 pb-24 transition-colors duration-200">
        
        {/* Шапка */}
        <header className="sticky top-0 bg-white dark:bg-black border-b border-slate-100 dark:border-zinc-900 px-5 py-3 flex items-center justify-between z-40">
          <div>
            {isEditingStoreName ? (
              <input
                autoFocus
                type="text"
                className="text-base font-bold text-slate-800 dark:text-zinc-100 bg-transparent outline-none border-b-2 border-orange-500 pb-0.5"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                onBlur={() => setIsEditingStoreName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingStoreName(false)}
              />
            ) : (
              <div 
                onClick={() => setIsEditingStoreName(true)}
                className="flex items-center gap-1.5 cursor-pointer group"
              >
                <h1 className="text-base font-black text-slate-800 dark:text-zinc-100 tracking-tight uppercase font-mono">
                  {storeName}
                </h1>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors" />
              </div>
            )}
            <p className="text-[9px] text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-wider mt-0.5">Интеллектуальный склад леса</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-1.5 text-slate-400 dark:text-zinc-400"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        </header>

        {/* Рабочая зона */}
        <main className="max-w-md mx-auto p-4 relative">
          
          {/* Уведомления */}
          {notification && (
            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 shadow-sm border animate-in ${
              notification.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
            }`}>
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <p className="text-xs font-bold">{notification.message}</p>
            </div>
          )}

          {activeTab === 'stock' && renderStock()}
          {activeTab === 'operations' && renderOperations()}
          {activeTab === 'debts' && renderDebts()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'database' && renderDatabase()}
        </main>

        {/* Таббар */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-slate-100 dark:border-zinc-900 pb-safe z-40">
          <div className="max-w-md mx-auto flex justify-around px-1 py-1.5">
            
            <button 
              onClick={() => setActiveTab('stock')}
              className={`flex flex-col items-center p-2 rounded-xl w-1/5 transition-colors ${activeTab === 'stock' ? 'text-orange-500 font-extrabold' : 'text-slate-400 dark:text-zinc-600'}`}
            >
              <div className={`p-1 rounded-lg mb-0.5 ${activeTab === 'stock' ? 'bg-orange-500/10' : 'bg-transparent'}`}>
                 <Package className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">Склад</span>
            </button>

            <button 
              onClick={() => setActiveTab('operations')}
              className={`flex flex-col items-center p-2 rounded-xl w-1/5 transition-colors ${activeTab === 'operations' ? 'text-orange-500 font-extrabold' : 'text-slate-400 dark:text-zinc-600'}`}
            >
              <div className={`p-1 rounded-lg mb-0.5 ${activeTab === 'operations' ? 'bg-orange-500/10' : 'bg-transparent'}`}>
                 <ArrowRightLeft className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">Сделка</span>
            </button>

            <button 
              onClick={() => setActiveTab('debts')}
              className={`flex flex-col items-center p-2 rounded-xl w-1/5 transition-colors ${activeTab === 'debts' ? 'text-orange-500' : 'text-slate-400'}`}
            >
              <div className={`p-1 rounded-lg mb-0.5 ${activeTab === 'debts' ? 'bg-orange-500/10' : 'bg-transparent'}`}>
                 <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">Насия</span>
            </button>

            <button 
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center p-2 rounded-xl w-1/5 transition-colors ${activeTab === 'history' ? 'text-orange-500' : 'text-slate-400'}`}
            >
              <div className={`p-1 rounded-lg mb-0.5 ${activeTab === 'history' ? 'bg-orange-500/10' : 'bg-transparent'}`}>
                 <Clock className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">Журнал</span>
            </button>

            <button 
              onClick={() => setActiveTab('database')}
              className={`flex flex-col items-center p-2 rounded-xl w-1/5 transition-colors ${activeTab === 'database' ? 'text-orange-500' : 'text-slate-400'}`}
            >
              <div className={`p-1 rounded-lg mb-0.5 ${activeTab === 'database' ? 'bg-orange-500/10' : 'bg-transparent'}`}>
                 <Database className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">База</span>
            </button>

          </div>
        </nav>
      </div>
    </div>
  );
}