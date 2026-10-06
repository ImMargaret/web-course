import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const roll = () => Math.floor(Math.random() * 6) + 1

function Die({ value }) {
  return <div className="die" aria-label={`Кубик: ${value}`}>{value}</div>
}

function App() {
  const [player, setPlayer] = useState([1, 1])
  const [computer, setComputer] = useState([1, 1])
  const [message, setMessage] = useState('Нажми «Бросить кубики», чтобы начать!')
  const [rounds, setRounds] = useState(0)
  const [wins, setWins] = useState({ player: 0, computer: 0, draw: 0 })

  const play = () => {
    const p = [roll(), roll()]
    const c = [roll(), roll()]
    const ps = p[0] + p[1]
    const cs = c[0] + c[1]

    setPlayer(p)
    setComputer(c)
    setRounds(r => r + 1)

    if (ps > cs) {
      setMessage('Ты победила! 🎉')
      setWins(w => ({ ...w, player: w.player + 1 }))
    } else if (ps < cs) {
      setMessage('Компьютер победил! 🤖')
      setWins(w => ({ ...w, computer: w.computer + 1 }))
    } else {
      setMessage('Ничья! 🤝')
      setWins(w => ({ ...w, draw: w.draw + 1 }))
    }
  }

  const reset = () => {
    setPlayer([1, 1])
    setComputer([1, 1])
    setMessage('Нажми «Бросить кубики», чтобы начать!')
    setRounds(0)
    setWins({ player: 0, computer: 0, draw: 0 })
  }

  return (
    <main className="page">
      <section className="game">
        <div className="eyebrow">REACT • VANILLA GAME CONCEPT</div>
        <h1>Дуэль на кубиках</h1>
        <p className="subtitle">Два кубика решают, кто сегодня сильнее.</p>

        <div className="players">
          <div className="player-card">
            <h2>Ты</h2>
            <div className="dice"><Die value={player[0]} /><Die value={player[1]} /></div>
            <strong>{player[0] + player[1]}</strong>
          </div>
          <div className="vs">VS</div>
          <div className="player-card">
            <h2>Компьютер</h2>
            <div className="dice"><Die value={computer[0]} /><Die value={computer[1]} /></div>
            <strong>{computer[0] + computer[1]}</strong>
          </div>
        </div>

        <div className="message">{message}</div>
        <button className="primary" onClick={play}>Бросить кубики</button>
        <button className="secondary" onClick={reset}>Сбросить</button>

        <div className="stats">
          <span>Раундов: <b>{rounds}</b></span>
          <span>Побед: <b>{wins.player}</b></span>
          <span>Компьютер: <b>{wins.computer}</b></span>
          <span>Ничьих: <b>{wins.draw}</b></span>
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
