class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.value = this.getRankValue();
    }

    getRankValue() {
        if (this.rank === 'A') return 14;
        if (this.rank === 'K') return 13;
        if (this.rank === 'Q') return 12;
        if (this.rank === 'J') return 11;
        return parseInt(this.rank);
    }

    getDisplayValue() {
        return this.rank;
    }

    getSuitSymbol() {
        const symbols = {
            'spade': '♠',
            'heart': '♥',
            'diamond': '♦',
            'club': '♣'
        };
        return symbols[this.suit];
    }

    getSuitClass() {
        return this.suit;
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        const suits = ['spade', 'heart', 'diamond', 'club'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        for (const suit of suits) {
            for (const rank of ranks) {
                this.cards.push(new Card(suit, rank));
            }
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw(count = 1) {
        const drawnCards = [];
        for (let i = 0; i < count; i++) {
            if (this.cards.length > 0) {
                drawnCards.push(this.cards.pop());
            }
        }
        return drawnCards;
    }
}

class PokerHand {
    constructor(cards) {
        this.cards = cards;
        this.sortCards();
    }

    sortCards() {
        this.cards.sort((a, b) => b.value - a.value);
    }

    evaluate() {
        if (this.isRoyalFlush()) return { rank: 10, name: 'ロイヤルフラッシュ' };
        if (this.isStraightFlush()) return { rank: 9, name: 'ストレートフラッシュ' };
        if (this.isFourOfAKind()) return { rank: 8, name: 'フォーカード' };
        if (this.isFullHouse()) return { rank: 7, name: 'フルハウス' };
        if (this.isFlush()) return { rank: 6, name: 'フラッシュ' };
        if (this.isStraight()) return { rank: 5, name: 'ストレート' };
        if (this.isThreeOfAKind()) return { rank: 4, name: 'スリーカード' };
        if (this.isTwoPair()) return { rank: 3, name: 'ツーペア' };
        if (this.isOnePair()) return { rank: 2, name: 'ワンペア' };
        return { rank: 1, name: 'ハイカード' };
    }

    isRoyalFlush() {
        return this.isStraightFlush() && this.cards[0].value === 14;
    }

    isStraightFlush() {
        return this.isFlush() && this.isStraight();
    }

    isFourOfAKind() {
        const values = this.cards.map(card => card.value);
        return values[0] === values[3] || values[1] === values[4];
    }

    isFullHouse() {
        const values = this.cards.map(card => card.value);
        return (values[0] === values[2] && values[3] === values[4]) ||
               (values[0] === values[1] && values[2] === values[4]);
    }

    isFlush() {
        const suit = this.cards[0].suit;
        return this.cards.every(card => card.suit === suit);
    }

    isStraight() {
        const values = this.cards.map(card => card.value);
        
        for (let i = 0; i < 4; i++) {
            if (values[i] - values[i + 1] !== 1) {
                if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
                    return true;
                }
                return false;
            }
        }
        return true;
    }

    isThreeOfAKind() {
        const values = this.cards.map(card => card.value);
        for (let i = 0; i < 3; i++) {
            if (values[i] === values[i + 1] && values[i] === values[i + 2]) {
                return true;
            }
        }
        return false;
    }

    isTwoPair() {
        const values = this.cards.map(card => card.value);
        let pairs = 0;
        for (let i = 0; i < 4; i++) {
            if (values[i] === values[i + 1]) {
                pairs++;
                i++;
            }
        }
        return pairs === 2;
    }

    isOnePair() {
        const values = this.cards.map(card => card.value);
        for (let i = 0; i < 4; i++) {
            if (values[i] === values[i + 1]) {
                return true;
            }
        }
        return false;
    }
}

class PokerGame {
    constructor() {
        this.deck = new Deck();
        this.playerHand = [];
        this.aiHand = [];
        this.selectedCards = new Set();
        this.gamePhase = 'waiting';
        this.aiLevel = 'easy'; // デフォルトは「かんたん」
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.startBtn = document.getElementById('start-btn');
        this.changeBtn = document.getElementById('change-btn');
        this.standBtn = document.getElementById('stand-btn');
        this.rulesBtn = document.getElementById('rules-btn');
        this.rulesModal = document.getElementById('rules-modal');
        this.closeModal = document.querySelector('.close');
        this.playerCardsDiv = document.querySelector('.player-cards');
        this.opponentCardsDiv = document.querySelector('.opponent-cards');
        this.messageDiv = document.getElementById('game-message');
        this.handRankDiv = document.getElementById('hand-rank');
        this.levelButtons = document.querySelectorAll('.level-btn');
    }

    attachEventListeners() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.startGame());
        }
        
        if (this.changeBtn) {
            this.changeBtn.addEventListener('click', () => this.changeCards());
        }
        
        if (this.standBtn) {
            this.standBtn.addEventListener('click', () => this.stand());
        }
        
        if (this.rulesBtn) {
            this.rulesBtn.addEventListener('click', () => this.showRules());
        }
        
        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => this.hideRules());
        }
        
        window.addEventListener('click', (event) => {
            if (event.target === this.rulesModal) {
                this.hideRules();
            }
        });

        if (this.playerCardsDiv) {
            this.playerCardsDiv.addEventListener('click', (e) => {
                if (e.target.classList.contains('card') && this.gamePhase === 'changing') {
                    this.toggleCardSelection(e.target);
                }
            });
        }

        // AIレベル選択のイベントリスナー
        this.levelButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setAILevel(e.target.dataset.level);
            });
        });
    }

    showRules() {
        if (this.rulesModal) {
            this.rulesModal.style.display = 'block';
        }
    }

    hideRules() {
        if (this.rulesModal) {
            this.rulesModal.style.display = 'none';
        }
    }

    setAILevel(level) {
        this.aiLevel = level;
        
        // ボタンのアクティブ状態を更新
        this.levelButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === level) {
                btn.classList.add('active');
            }
        });
    }

    startGame() {
        this.deck.reset();
        this.playerHand = this.deck.draw(5);
        this.aiHand = this.deck.draw(5);
        this.selectedCards.clear();
        this.gamePhase = 'dealing';
        
        if (this.messageDiv) {
            this.messageDiv.textContent = 'カードを配っています...';
        }
        
        if (this.startBtn) this.startBtn.style.display = 'none';
        
        // アニメーション付きでカードを配布
        this.displayAIHand(false, true);
        
        setTimeout(() => {
            this.displayPlayerHand(true);
        }, 500);
        
        // 配布完了後にゲーム開始
        setTimeout(() => {
            this.gamePhase = 'changing';
            this.updateHandRank();
            
            if (this.messageDiv) {
                this.messageDiv.textContent = 'カードを交換する？';
            }
            
            if (this.changeBtn) this.changeBtn.style.display = 'inline-block';
            if (this.standBtn) this.standBtn.style.display = 'inline-block';
        }, 2500);
    }

    displayPlayerHand(animated = false) {
        if (!this.playerCardsDiv) return;
        
        this.playerCardsDiv.innerHTML = '';
        
        if (animated) {
            this.animateCardDealing(this.playerHand, this.playerCardsDiv, false);
        } else {
            this.playerHand.forEach((card, index) => {
                const cardDiv = document.createElement('div');
                cardDiv.className = `card ${card.getSuitClass()}`;
                cardDiv.dataset.index = index;
                cardDiv.textContent = card.getDisplayValue();
                this.playerCardsDiv.appendChild(cardDiv);
            });
        }
    }

    displayAIHand(reveal = false, animated = false) {
        if (!this.opponentCardsDiv) return;
        
        this.opponentCardsDiv.innerHTML = '';
        
        if (animated && !reveal) {
            this.animateCardDealing(this.aiHand, this.opponentCardsDiv, true);
        } else {
            this.aiHand.forEach((card) => {
                const cardDiv = document.createElement('div');
                if (reveal) {
                    cardDiv.className = `card ${card.getSuitClass()}`;
                    cardDiv.textContent = card.getDisplayValue();
                } else {
                    cardDiv.className = 'card back';
                }
                this.opponentCardsDiv.appendChild(cardDiv);
            });
        }
    }

    animateCardDealing(cards, container, isBack = false) {
        cards.forEach((card, index) => {
            setTimeout(() => {
                const cardDiv = document.createElement('div');
                
                if (isBack) {
                    cardDiv.className = 'card back dealing-from-deck';
                } else {
                    cardDiv.className = `card ${card.getSuitClass()} dealing-from-deck`;
                    cardDiv.dataset.index = index;
                    cardDiv.textContent = card.getDisplayValue();
                }
                
                container.appendChild(cardDiv);
                
                setTimeout(() => {
                    cardDiv.classList.add('animate-in');
                }, 50);
                
                setTimeout(() => {
                    cardDiv.classList.remove('dealing-from-deck', 'animate-in');
                }, 1000);
                
            }, index * 200);
        });
    }

    toggleCardSelection(cardElement) {
        const index = parseInt(cardElement.dataset.index);
        if (this.selectedCards.has(index)) {
            this.selectedCards.delete(index);
            cardElement.classList.remove('selected');
        } else {
            this.selectedCards.add(index);
            cardElement.classList.add('selected');
        }
    }

    changeCards() {
        const indices = Array.from(this.selectedCards).sort((a, b) => b - a);
        indices.forEach(index => {
            this.playerHand.splice(index, 1);
        });
        
        const newCards = this.deck.draw(indices.length);
        this.playerHand.push(...newCards);
        
        this.aiChangeCards();
        this.endGame();
    }

    aiChangeCards() {
        switch (this.aiLevel) {
            case 'easy':
                this.aiChangeCardsEasy();
                break;
            case 'normal':
                this.aiChangeCardsNormal();
                break;
            case 'hard':
                this.aiChangeCardsHard();
                break;
        }
    }

    // かんたん：ランダムに0-4枚交換
    aiChangeCardsEasy() {
        const cardsToChangeCount = Math.floor(Math.random() * 5);
        if (cardsToChangeCount === 0) return;
        
        const cardsToChange = [];
        const shuffledHand = [...this.aiHand].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < cardsToChangeCount; i++) {
            cardsToChange.push(shuffledHand[i]);
        }
        
        this.aiHand = this.aiHand.filter(card => !cardsToChange.includes(card));
        this.aiHand.push(...this.deck.draw(cardsToChange.length));
    }

    // ふつう：基本的な戦略
    aiChangeCardsNormal() {
        const aiHandEval = new PokerHand([...this.aiHand]).evaluate();
        
        if (aiHandEval.rank >= 5) {
            return;
        }
        
        let cardsToChange = [];
        if (aiHandEval.rank === 2) {
            const values = this.aiHand.map(card => card.value).sort((a, b) => b - a);
            const pairValue = values.find(v => values.filter(val => val === v).length === 2);
            cardsToChange = this.aiHand.filter(card => card.value !== pairValue);
        } else {
            const sortedHand = [...this.aiHand].sort((a, b) => a.value - b.value);
            cardsToChange = sortedHand.slice(0, 3);
        }
        
        this.aiHand = this.aiHand.filter(card => !cardsToChange.includes(card));
        this.aiHand.push(...this.deck.draw(cardsToChange.length));
    }

    // むずかしい：高度な戦略
    aiChangeCardsHard() {
        const aiHandEval = new PokerHand([...this.aiHand]).evaluate();
        
        // 既に強い役がある場合は交換しない
        if (aiHandEval.rank >= 4) {
            return;
        }
        
        let cardsToChange = [];
        
        if (aiHandEval.rank === 3) { // ツーペア
            // 一番弱いカードのみ交換
            const values = this.aiHand.map(card => card.value);
            const counts = {};
            values.forEach(v => counts[v] = (counts[v] || 0) + 1);
            const singles = values.filter(v => counts[v] === 1);
            if (singles.length > 0) {
                const weakest = Math.min(...singles);
                cardsToChange = this.aiHand.filter(card => card.value === weakest);
            }
        } else if (aiHandEval.rank === 2) { // ワンペア
            // ペア以外を交換
            const values = this.aiHand.map(card => card.value).sort((a, b) => b - a);
            const pairValue = values.find(v => values.filter(val => val === v).length === 2);
            cardsToChange = this.aiHand.filter(card => card.value !== pairValue);
        } else {
            // ストレートやフラッシュの可能性をチェック
            const straightPossible = this.checkStraightPossibility();
            const flushPossible = this.checkFlushPossibility();
            
            if (straightPossible.length > 0) {
                cardsToChange = straightPossible;
            } else if (flushPossible.length > 0) {
                cardsToChange = flushPossible;
            } else {
                // 最も弱い3枚を交換
                const sortedHand = [...this.aiHand].sort((a, b) => a.value - b.value);
                cardsToChange = sortedHand.slice(0, 3);
            }
        }
        
        this.aiHand = this.aiHand.filter(card => !cardsToChange.includes(card));
        this.aiHand.push(...this.deck.draw(cardsToChange.length));
    }

    checkStraightPossibility() {
        const values = this.aiHand.map(card => card.value).sort((a, b) => a - b);
        const uniqueValues = [...new Set(values)];
        
        // 4枚が連続している場合
        for (let i = 0; i < uniqueValues.length - 3; i++) {
            if (uniqueValues[i + 3] - uniqueValues[i] === 3) {
                const straightCards = this.aiHand.filter(card => 
                    card.value >= uniqueValues[i] && card.value <= uniqueValues[i + 3]
                );
                if (straightCards.length === 4) {
                    return this.aiHand.filter(card => !straightCards.includes(card));
                }
            }
        }
        return [];
    }

    checkFlushPossibility() {
        const suits = {};
        this.aiHand.forEach(card => {
            suits[card.suit] = (suits[card.suit] || 0) + 1;
        });
        
        // 4枚が同じスートの場合
        for (const suit in suits) {
            if (suits[suit] === 4) {
                return this.aiHand.filter(card => card.suit !== suit);
            }
        }
        return [];
    }

    stand() {
        this.aiChangeCards();
        this.endGame();
    }

    updateHandRank() {
        if (!this.handRankDiv || this.playerHand.length === 0) return;
        
        const hand = new PokerHand([...this.playerHand]);
        const evaluation = hand.evaluate();
        this.handRankDiv.textContent = `あなたの役: ${evaluation.name}`;
    }

    endGame() {
        this.gamePhase = 'ended';
        this.displayAIHand(true);
        
        const playerHandEval = new PokerHand([...this.playerHand]).evaluate();
        const aiHandEval = new PokerHand([...this.aiHand]).evaluate();
        
        this.updateHandRank();
        
        let resultMessage = '';
        if (playerHandEval.rank > aiHandEval.rank) {
            resultMessage = `やったね！勝ちだよ！💖\n（あなた: ${playerHandEval.name} vs AI: ${aiHandEval.name}）`;
        } else if (playerHandEval.rank < aiHandEval.rank) {
            resultMessage = `残念...負けちゃった😢\n（あなた: ${playerHandEval.name} vs AI: ${aiHandEval.name}）`;
        } else {
            resultMessage = `引き分け！\n（どちらも: ${playerHandEval.name}）`;
        }
        
        if (this.messageDiv) {
            this.messageDiv.textContent = resultMessage;
        }
        
        if (this.changeBtn) this.changeBtn.style.display = 'none';
        if (this.standBtn) this.standBtn.style.display = 'none';
        if (this.startBtn) {
            this.startBtn.style.display = 'inline-block';
            this.startBtn.textContent = 'もう一回！';
        }
    }
}

// 初期化を確実に行うため、複数の方法で試みる
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pokerGame = new PokerGame();
    });
} else {
    // すでにDOMが読み込まれている場合
    window.pokerGame = new PokerGame();
}

// フォールバック: 念のため、window.onloadでも初期化
window.addEventListener('load', () => {
    if (!window.pokerGame) {
        window.pokerGame = new PokerGame();
    }
});