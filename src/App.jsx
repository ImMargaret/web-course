import { useEffect, useRef, useState } from 'react';
import MonthWheel from './components/MonthWheel.jsx';
import Calendar from './components/Calendar.jsx';
import Dialog from './components/Dialog.jsx';
import { Arrow, SectionEdge } from './components/Icons.jsx';
import { INITIAL_VIEW, MONTHS, readableDate, validateBooking } from './lib/calendar.mjs';
import { BOOKING_KEY, CONTACT_KEY, saveDemoRecord } from './lib/storage.mjs';
import headerLogo from './assets/header-56.png';
import footerLogo from './assets/logo-56.svg';
const COMMUNITY = 'https://vk.ru/56proekt';

export default function App() {
  const [view, setView] = useState(INITIAL_VIEW);
  const [date, setDate] = useState('');
  const [name, setName] = useState(''), [phone, setPhone] = useState(''), [event, setEvent] = useState('');
  const [errors, setErrors] = useState({});
  const [review, setReview] = useState(false), [menu, setMenu] = useState(false), [receipt, setReceipt] = useState(null);
  const [email, setEmail] = useState(''), [emailStatus, setEmailStatus] = useState('');
  const resultRef = useRef(null);
  useEffect(() => { if (receipt) resultRef.current?.focus(); }, [receipt]);
  function changeView(next) {
    if (next.year === view.year && next.month === view.month) return;
    setView(next); setDate(''); setErrors(previous => ({ ...previous, date: '' }));
  }
  function chooseDate(value) {
    setDate(value); setErrors(previous => ({ ...previous, date: '' }));
  }
  function reviewBooking(submitEvent) {
    submitEvent.preventDefault();
    const next = validateBooking({ name, phone, date });
    setErrors(next);
    if (Object.keys(next).length) {
      const id = next.date ? 'calendar-title' : next.name ? 'guest-name' : 'guest-phone';
      document.getElementById(id)?.focus(); return;
    }
    setReview(true);
  }
  function confirmBooking() {
    const next = validateBooking({ name, phone, date });
    if (Object.keys(next).length) { setErrors(next); setReview(false); return; }
    const record = { id: '56-' + Date.now().toString(36).toUpperCase(), name: name.trim(), phone: phone.trim(), date, event: event.trim(), createdAt: new Date().toISOString() };
    const saved = saveDemoRecord(BOOKING_KEY, record);
    setReview(false); setReceipt({ ...record, saved });
  }
  function startAgain() {
    setReceipt(null); setName(''); setPhone(''); setEvent(''); setDate(''); setErrors({});
    requestAnimationFrame(() => document.getElementById('calendar-title')?.focus());
  }
  function sendEmail(submitEvent) {
    submitEvent.preventDefault();
    const saved = saveDemoRecord(CONTACT_KEY, { email: email.trim(), createdAt: new Date().toISOString() });
    setEmailStatus(saved ? 'Email сохранён в деморежиме. Сообщение пространству не отправлено.' : 'Email принят в деморежиме. Сохранение в этом браузере недоступно.');
    setEmail('');
  }
  return <div className="page" id="top">
    <a className="skip-link" href="#booking">Перейти к бронированию</a>
    <header className="site-header">
      <button className="menu-button" type="button" aria-label="Открыть меню" aria-expanded={menu} onClick={() => setMenu(true)}><span /><span /><span /></button>
      <a className="header-brand" href="#top" aria-label="56 — в начало страницы"><img src={headerLogo} alt="56 проект" width="132" height="133" /></a>
    </header>
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-kicker"><h1 id="hero-title">Время забронировать</h1><p className="parenthetical"><span>(</span><em>Дом купца Башкирова</em><span>)</span></p><p className="hero-end">Пространство для себя</p></div>
        <p className="hero-intro" id="about">56 — дом с историей и пространство для ваших событий. Кофейня, залы и лучше отношение к гостям<br className="desktop-break" /> в центре Нижнего Новгорода.</p>
      </section>
      <section className="wheel-section framed-section" id="months" aria-labelledby="month-title">
        <SectionEdge />
        <h2 className="split-title" id="month-title"><span>ВЫБИРАЙТЕ</span><em>УДОБНЫЙ МЕСЯЦ</em></h2>
        <MonthWheel month={view.month} onChange={month => changeView({ ...view, month })} />
      </section>
      <section className="booking-section framed-section" id="booking" aria-labelledby="booking-title">
        <SectionEdge />
        <div className="booking-heading"><h2 className="split-title" id="booking-title"><span>ПОЗВОНИМ</span><em>ВАМ</em></h2><p className="parenthetical"><span>(</span><em>Оставьте заявку на бронь</em><span>)</span></p></div>
        <div className="booking-content">
          <Calendar view={view} selected={date} onViewChange={changeView} onSelect={chooseDate} error={errors.date} />
          {receipt ? <section className="booking-result" ref={resultRef} tabIndex="-1" aria-labelledby="result-title">
            <p className="small-label">ДО ВСТРЕЧИ В 56</p><h3 id="result-title">Заявка готова.</h3>
            <dl><div><dt>Дата</dt><dd>{readableDate(receipt.date)}</dd></div><div><dt>Имя</dt><dd>{receipt.name}</dd></div><div><dt>Телефон</dt><dd>{receipt.phone}</dd></div>{receipt.event && <div><dt>О событии</dt><dd>{receipt.event}</dd></div>}</dl>
            <p className="demo-note">{receipt.saved ? 'Учебный прототип: заявка сохранена только в этом браузере. Пространству она не отправлена.' : 'Учебный прототип: заявка собрана. Браузер не разрешил сохранить её; пространству она не отправлена.'}</p>
            <button className="submit-button" type="button" onClick={startAgain}>Новая заявка<Arrow direction="diagonal" /></button>
          </section> : <form className="booking-form" onSubmit={reviewBooking} noValidate aria-label="Заявка на бронирование">
            <p className="booking-copy">Выберите желаемую дату, расскажите о вашем событии и оставьте контакты. Мы свяжемся с вами, обсудим детали и ответим на вопросы.</p>
            <div className="field-wrap"><label className="sr-only" htmlFor="guest-name">Ваше имя</label><input className="text-input" id="guest-name" name="name" type="text" placeholder="Ваше имя" autoComplete="given-name" value={name} maxLength="80" required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} onChange={e => { setName(e.target.value); setErrors(previous => ({ ...previous, name: '' })); }} />{errors.name && <p className="field-error" id="name-error">{errors.name}</p>}</div>
            <div className="field-wrap phone-wrap"><label className="sr-only" htmlFor="guest-phone">Ваш телефон</label><input className="text-input" id="guest-phone" name="phone" type="tel" inputMode="tel" placeholder="+7 999 999 99 99" autoComplete="tel" value={phone} maxLength="32" required aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} onChange={e => { setPhone(e.target.value); setErrors(previous => ({ ...previous, phone: '' })); }} />{errors.phone && <p className="field-error" id="phone-error">{errors.phone}</p>}</div>
            <button className="submit-button" type="submit">Отправить заявку на бронь<Arrow direction="diagonal" /></button>
            <p className="demo-note">Учебный прототип · заявка не отправляется пространству</p>
          </form>}
        </div>
        <SectionEdge bottom />
      </section>
      <section className="farewell" aria-label="Увидимся у нас"><p className="split-title"><span>УВИДИМСЯ</span><em>У НАС!</em></p></section>
    </main>
    <footer className="site-footer" id="contacts">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-links"><div><p className="footer-label">Пространство</p><div className="footer-link-columns"><div><a href="#top">Главная</a><a href="#about">О нас</a><a href={COMMUNITY} target="_blank" rel="noreferrer">Залы</a></div><div><a href={COMMUNITY} target="_blank" rel="noreferrer">Афиша</a><a href="#booking">Аренда</a><a href="#footer-email">Контакты</a></div></div></div>
          <div><p className="footer-label">Соцсети</p><a href={COMMUNITY} target="_blank" rel="noreferrer">ВКонтакте</a><span className="footer-unlinked" aria-label="Telegram: адрес канала не предоставлен">Telegram</span></div></div>
        </div>
        <div className="footer-right"><h2>Дом, в котором<br />происходит жизнь</h2><p>Давайте обсудим ваше событие!</p><form className="email-form" onSubmit={sendEmail}><label className="sr-only" htmlFor="footer-email">Ваш email</label><input type="email" id="footer-email" name="email" placeholder="Ваш email" autoComplete="email" required maxLength="254" value={email} onChange={e => { setEmail(e.target.value); setEmailStatus(''); }} /><button type="submit" aria-label="Отправить email"><Arrow direction="down-diagonal" /></button></form><p className="email-status" role="status">{emailStatus}</p></div>
      </div>
      <img className="footer-logo" src={footerLogo} alt="56" width="346" height="349" />
      <a className="back-top" href="#top" aria-label="Наверх"><Arrow direction="up" /></a>
    </footer>
    {menu && <Dialog title="56" onClose={() => setMenu(false)}><nav className="menu-links" aria-label="Разделы страницы"><a href="#months" onClick={() => setMenu(false)}>Выбрать месяц<Arrow direction="diagonal" /></a><a href="#booking" onClick={() => setMenu(false)}>Оставить заявку<Arrow direction="diagonal" /></a><a href="#contacts" onClick={() => setMenu(false)}>Контакты<Arrow direction="diagonal" /></a><a href={COMMUNITY} target="_blank" rel="noreferrer">Сообщество пространства<Arrow direction="diagonal" /></a></nav></Dialog>}
    {review && <Dialog title="Ваше событие в 56." onClose={() => setReview(false)}>
      <p className="review-intro">Проверьте дату и контакты. Можно добавить пару слов о событии.</p>
      <dl className="review-details"><div><dt>Дата</dt><dd>{readableDate(date)}</dd></div><div><dt>Имя</dt><dd>{name.trim()}</dd></div><div><dt>Телефон</dt><dd>{phone.trim()}</dd></div></dl>
      <label className="event-label" htmlFor="event-description">О событии <span>(необязательно)</span></label><textarea id="event-description" className="text-input event-input" placeholder="Формат, число гостей, пожелания" maxLength="800" rows="3" value={event} onChange={e => setEvent(e.target.value)} />
      <p className="demo-note">Это учебный прототип. Подтверждение сохранит заявку только в вашем браузере.</p>
      <button className="submit-button" type="button" onClick={confirmBooking}>Подтвердить заявку<Arrow direction="diagonal" /></button>
      <button className="edit-button" type="button" onClick={() => setReview(false)}>Вернуться и изменить</button>
    </Dialog>}
  </div>;
}
