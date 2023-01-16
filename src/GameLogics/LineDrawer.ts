import { Hand, Keypoint } from '@tensorflow-models/hand-pose-detection';
import * as params from './params';
import { Gesture } from './Gesture';

export class LineDrawer {
    video: HTMLVideoElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    letter_canvas: HTMLCanvasElement;
    letter_ctx: CanvasRenderingContext2D;
    buffer: Array<Array<Keypoint>>;
    tmp_buff: Array<Keypoint>;
    push_flg: boolean;
    state: boolean;

    constructor(canvas: HTMLCanvasElement) {
        this.video = document.getElementById('video') as HTMLVideoElement;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.letter_canvas = document.getElementById('letter') as HTMLCanvasElement;
        this.letter_ctx = this.letter_canvas.getContext('2d') as CanvasRenderingContext2D;
        this.buffer = [];
        this.tmp_buff = [];
        this.push_flg = false;
        this.state = false;
    }

    public setup() {
        //文字取得用キャンバスの設定
        this.letter_canvas.width = params.DEFAULT_CANVAS_WIDTH;
        this.letter_canvas.height = params.DEFAULT_CANVAS_WIDTH;
        this.letter_ctx.translate(this.letter_canvas.width, 0);
        this.letter_ctx.scale(-1,1);

        // イベントの登録
        // キーを押した時
        document.addEventListener('keydown', (e) => {
            // qを押した時に、キャンバスをクリアする
            if (e.key == "q") {
                const ret = confirm('canvasの内容を削除します。');
                // アラートで「OK」を選んだ時
                if (ret == true) {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.letter_ctx.clearRect(0, 0, this.letter_canvas.width, this.letter_canvas.height);
                    this.buffer = [];
                    this.tmp_buff = [];
                }
            }
            if(e.key == "a") {
                console.log(this.buffer);
            }
            // tを押した時に、文字用キャンバスから画像を生成する
            if(e.key == "t") {
                var png = this.letter_canvas.toDataURL();
                var img_tag = document.getElementById("image") as HTMLMediaElement;
                console.log(typeof(img_tag));
                img_tag.src = png;
            }
        })

        console.log("setup completed!");
    }

    public draw() {
        this.ctx.lineJoin = params.DEFAULT_LINE_JOIN;
        this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;
        this.ctx.lineCap = params.DEFAULT_LINE_CAP;
        this.ctx.beginPath();
        if(this.buffer.length != 0) {
            for(let i = 0; i < this.buffer.length; i++) {
                this.ctx.moveTo(this.buffer[i][0].x, this.buffer[i][0].y);
                for(let j = 1; j < this.buffer[i].length; j++) {
                    const x = this.buffer[i][j].x;
                    const y = this.buffer[i][j].y;
                    this.ctx.lineTo(x,y);
                }
            }
        }

        if(this.tmp_buff.length != 0) {
            this.ctx.moveTo(this.tmp_buff[0].x, this.tmp_buff[0].y) 
            for (let i = 1; i < this.tmp_buff.length; i++) {
                this.ctx.lineTo(this.tmp_buff[i].x, this.tmp_buff[i].y)
            }
        }
        this.ctx.stroke();
        this.ctx.closePath();

        // 文字取得用キャンバスへの描画
        this.letter_ctx.lineJoin = params.DEFAULT_LINE_JOIN;
        this.letter_ctx.lineWidth = params.DEFAULT_LINE_WIDTH;
        this.letter_ctx.lineCap = params.DEFAULT_LINE_CAP;
        this.letter_ctx.beginPath();
        if(this.buffer.length != 0) {
            for(let i = 0; i < this.buffer.length; i++) {
                this.letter_ctx.moveTo(this.buffer[i][0].x, this.buffer[i][0].y);
                for(let j = 1; j < this.buffer[i].length; j++) {
                    const x = this.buffer[i][j].x;
                    const y = this.buffer[i][j].y;
                    this.letter_ctx.lineTo(x,y);
                }
            }
        }
        if(this.tmp_buff.length != 0) {
            this.letter_ctx.moveTo(this.tmp_buff[0].x, this.tmp_buff[0].y) 
            for (let i = 1; i < this.tmp_buff.length; i++) {
                this.letter_ctx.lineTo(this.tmp_buff[i].x, this.tmp_buff[i].y)
            }
        }
        this.letter_ctx.stroke();
        this.letter_ctx.closePath();
    }

    public getHands(hands: Hand[]) {

        //ジェスチャー判定器
        const gesture = new Gesture;

        //右手の人差し指だけを取得 => 左利きには対応していない
        const index_point = hands[0].keypoints.filter((kp) => {
            if(kp.name == "index_finger_tip") {
                return kp;
            }
        })
        
        // "一"のジェスチャーをすると、push_flgがオンになり、一時バッファに座標が追加される。
        // 別のジェスチャーになったタイミングでpush_flgがオンになっていたら一時バッファを値をブッファに追加する。
        if(gesture.detectFingerPose(hands[0].keypoints) == "一") {
            if(!this.push_flg) {
                this.push_flg = true;
            }
            this.tmp_buff.push(index_point[0]);
        } else if(gesture.detectFingerPose(hands[0].keypoints) == "good") {
            if(this.buffer.length != 0) {
                this.state = true;
                console.log("good");
            }
            this.push_flg = false;
        } else {
            if(this.push_flg) {
                this.buffer.push(this.tmp_buff);
                this.tmp_buff = [];
            }
            this.push_flg = false;
        }
    }
}