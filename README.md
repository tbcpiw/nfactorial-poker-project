# 🃏 NFactorial Poker

Онлайн мультиплеерный покер, разработанный с использованием **React**, **Node.js**, и **Socket.IO**. Ссылка на видео-демо:
https://youtu.be/pTaiv-TyOl8

## 🚀 Возможности

* Приватные игровые комнаты
* Живое взаимодействие игроков через WebSocket
* Этапы игры: Preflop, Flop, Turn, River, Showdown
* Определение победителя через `poker-evaluator`
* Поддержка 2+ игроков

## 🧐 Технологии

* **Frontend**: React, TailwindCSS
* **Backend**: Node.js, Express, Socket.IO
* **Пакеты**:

  * `poker-evaluator`: определение силы руки
  * `uuid`: генерация уникальных ID
  * `socket.io-client`: клиентский WebSocket

---

## 📦 Установка

### 1. Клонировать репозиторий

```bash
git clone https://github.com/твой-юзернейм/nfactorial_poker_project.git
cd nfactorial_poker_project
```

### 2. Установить зависимости

#### Сервер:

```bash
cd server
npm install
```

#### Клиент:

```bash
cd client
npm install
```

---

## ▶️ Запуск проекта

### Сервер:

```bash
cd server
node index.js
```

### Клиент:

```bash
cd client
npm start
```

---


## 💡 Как играть

1. Открой приложение
2. Введи свое имя
3. Создай комнату или введи `Room ID`
4. Жди как минимум еще одного игрока
5. Хост нажимает “Start Game”, чтобы начать

---

