    // client/src/pages/RulesPage.js
    import { useNavigate } from 'react-router-dom';

    export default function RulesPage() {
    const navigate = useNavigate();
    return (
        <div className="rules-container">
        <h1>Правила Техасского Холдема</h1>

        <section>
            <h2>Цель игры</h2>
            <p>
            Собрать лучшую покерную руку из пяти карт: комбинация из двух ваших закрытых и пяти общих карт.
            </p>
        </section>

        <section>
            <h2>Этапы игры</h2>
            <ol>
            <li><strong>Pre-flop:</strong> каждому игроку раздаётся по две закрытые карты.</li>
            <li><strong>Flop:</strong> открываются первые три общие карты.</li>
            <li><strong>Turn:</strong> открывается четвёртая общая карта.</li>
            <li><strong>River:</strong> открывается пятая общая карта.</li>
            <li><strong>Showdown:</strong> оставшиеся игроки сравнивают руки и определяется победитель.</li>
            </ol>
        </section>

        <section>
            <h2>Действия игроков</h2>
            <ul>
            <li><strong>Fold:</strong> сбросить карты и выбыть из раунда.</li>
            <li><strong>Check:</strong> пропустить ход без ставки (если текущая ставка равна вашей).</li>
            <li><strong>Call:</strong> уравнять текущую ставку.</li>
            <li><strong>Raise:</strong> повысить ставку.</li>
            </ul>
        </section>

        <button onClick={() => navigate(-1)}>← Назад</button>
        </div>
    );
    }
