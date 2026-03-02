const BelvaEngine = {

    hurufSet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    bersihkan(teks){
        return teks.toUpperCase().replace(/[^A-Z]/g,"");
    },

    modAman(x,m){
        return ((x % m)+m)%m;
    },

    fpb(a,b){
        return b==0?a:this.fpb(b,a%b);
    },

    inversMod(a,m){
        for(let i=1;i<m;i++){
            if((a*i)%m==1) return i;
        }
        return null;
    },


    vigenereEnc(teks,key){
        teks=this.bersihkan(teks);
        key=this.bersihkan(key);
        if(key.length==0) return "KEY KOSONG!";
        let hasil="";
        for(let i=0;i<teks.length;i++){
            let p=this.hurufSet.indexOf(teks[i]);
            let k=this.hurufSet.indexOf(key[i%key.length]);
            hasil+=this.hurufSet[(p+k)%26];
        }
        return hasil;
    },

    vigenereDec(teks,key){
        teks=this.bersihkan(teks);
        key=this.bersihkan(key);
        if(key.length==0) return "KEY KOSONG!";
        let hasil="";
        for(let i=0;i<teks.length;i++){
            let c=this.hurufSet.indexOf(teks[i]);
            let k=this.hurufSet.indexOf(key[i%key.length]);
            hasil+=this.hurufSet[this.modAman(c-k,26)];
        }
        return hasil;
    },

/* ================= AFFINE ================= */

    affineEnc(teks,a,b){
        teks=this.bersihkan(teks);
        if(this.fpb(a,26)!=1) return "NILAI A TIDAK VALID!";
        let hasil="";
        for(let h of teks){
            let p=this.hurufSet.indexOf(h);
            hasil+=this.hurufSet[(a*p+b)%26];
        }
        return hasil;
    },

    affineDec(teks,a,b){
        teks=this.bersihkan(teks);
        let inv=this.inversMod(a,26);
        if(!inv) return "TIDAK ADA INVERS!";
        let hasil="";
        for(let h of teks){
            let c=this.hurufSet.indexOf(h);
            hasil+=this.hurufSet[this.modAman(inv*(c-b),26)];
        }
        return hasil;
    },


    buatMatrix(key){
        key=this.bersihkan(key).replace(/J/g,"I");
        let gabungan="";
        for(let h of key){
            if(!gabungan.includes(h)) gabungan+=h;
        }
        for(let h of this.hurufSet){
            if(h!="J" && !gabungan.includes(h)) gabungan+=h;
        }
        return gabungan;
    },

    preparePlayfairText(teks){
        teks=this.bersihkan(teks).replace(/J/g,"I");
        let hasil="";
        for(let i=0;i<teks.length;i++){
            let a=teks[i];
            let b=teks[i+1];
            if(a===b){
                hasil+=a+"X";
            }else if(b){
                hasil+=a+b;
                i++;
            }else{
                hasil+=a+"X";
            }
        }
        return hasil;
    },

    playfair(teks,key,mode){
        if(key.length==0) return "KEY KOSONG!";
        let matrix=this.buatMatrix(key);
        if(mode==="enc") teks=this.preparePlayfairText(teks);
        else teks=this.bersihkan(teks).replace(/J/g,"I");

        let hasil="";
        for(let i=0;i<teks.length;i+=2){
            let a=teks[i], b=teks[i+1];
            let posA=matrix.indexOf(a), posB=matrix.indexOf(b);
            let rA=Math.floor(posA/5), cA=posA%5;
            let rB=Math.floor(posB/5), cB=posB%5;

            if(mode==="enc"){
                if(rA===rB){
                    hasil+=matrix[rA*5+((cA+1)%5)];
                    hasil+=matrix[rB*5+((cB+1)%5)];
                }else if(cA===cB){
                    hasil+=matrix[((rA+1)%5)*5+cA];
                    hasil+=matrix[((rB+1)%5)*5+cB];
                }else{
                    hasil+=matrix[rA*5+cB];
                    hasil+=matrix[rB*5+cA];
                }
            }else{
                if(rA===rB){
                    hasil+=matrix[rA*5+((cA+4)%5)];
                    hasil+=matrix[rB*5+((cB+4)%5)];
                }else if(cA===cB){
                    hasil+=matrix[((rA+4)%5)*5+cA];
                    hasil+=matrix[((rB+4)%5)*5+cB];
                }else{
                    hasil+=matrix[rA*5+cB];
                    hasil+=matrix[rB*5+cA];
                }
            }
        }
        return hasil;
    },


    rotorI: "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
    rotorII: "AJDKSIRUXBLHWTMCQGZNPYFVOE",
    rotorIII: "BDFHJLCPRTXVZNYEIWGAKMUSQO",
    reflectorB: "YRUHQSLDPXNGOKMIEBFZCWVJAT",

    enigmaProses(teks,key){
        teks=this.bersihkan(teks);
        key=this.bersihkan(key);
        if(key.length!==3) return "KEY ENIGMA HARUS 3 HURUF!";

        let hasil="";
        let pos1=this.hurufSet.indexOf(key[0]);
        let pos2=this.hurufSet.indexOf(key[1]);
        let pos3=this.hurufSet.indexOf(key[2]);

        for(let huruf of teks){

            pos1=(pos1+1)%26;

            let idx=this.hurufSet.indexOf(huruf);

            idx=(idx+pos1)%26;
            idx=this.hurufSet.indexOf(this.rotorI[idx]);
            idx=this.modAman(idx-pos1,26);

            idx=(idx+pos2)%26;
            idx=this.hurufSet.indexOf(this.rotorII[idx]);
            idx=this.modAman(idx-pos2,26);

            idx=(idx+pos3)%26;
            idx=this.hurufSet.indexOf(this.rotorIII[idx]);
            idx=this.modAman(idx-pos3,26);

            idx=this.hurufSet.indexOf(this.reflectorB[idx]);

            idx=(idx+pos3)%26;
            idx=this.rotorIII.indexOf(this.hurufSet[idx]);
            idx=this.modAman(idx-pos3,26);

            idx=(idx+pos2)%26;
            idx=this.rotorII.indexOf(this.hurufSet[idx]);
            idx=this.modAman(idx-pos2,26);

            idx=(idx+pos1)%26;
            idx=this.rotorI.indexOf(this.hurufSet[idx]);
            idx=this.modAman(idx-pos1,26);

            hasil+=this.hurufSet[idx];
        }

        return hasil;
    },


    hill2x2Enc(teks,key){
        teks=this.bersihkan(teks);
        let k=key.split(",").map(Number);
        if(k.length!==4) return "KEY HARUS 4 ANGKA! Contoh: 3,3,2,5";

        let a=k[0], b=k[1], c=k[2], d=k[3];

        if(teks.length%2!==0) teks+="X";

        let hasil="";
        for(let i=0;i<teks.length;i+=2){
            let x=this.hurufSet.indexOf(teks[i]);
            let y=this.hurufSet.indexOf(teks[i+1]);

            let r1=this.modAman(a*x+b*y,26);
            let r2=this.modAman(c*x+d*y,26);

            hasil+=this.hurufSet[r1]+this.hurufSet[r2];
        }
        return hasil;
    },

    hill2x2Dec(teks,key){
        teks=this.bersihkan(teks);
        let k=key.split(",").map(Number);
        if(k.length!==4) return "KEY HARUS 4 ANGKA!";

        let a=k[0], b=k[1], c=k[2], d=k[3];

        let det=this.modAman(a*d-b*c,26);
        let invDet=this.inversMod(det,26);
        if(invDet==null) return "Determinan tidak punya invers mod 26!";

        let A=this.modAman(d*invDet,26);
        let B=this.modAman(-b*invDet,26);
        let C=this.modAman(-c*invDet,26);
        let D=this.modAman(a*invDet,26);

        let hasil="";
        for(let i=0;i<teks.length;i+=2){
            let x=this.hurufSet.indexOf(teks[i]);
            let y=this.hurufSet.indexOf(teks[i+1]);

            let r1=this.modAman(A*x+B*y,26);
            let r2=this.modAman(C*x+D*y,26);

            hasil+=this.hurufSet[r1]+this.hurufSet[r2];
        }
        return hasil;
    },


    encryptNow(){
        let mode=document.getElementById("pilihCipher").value;
        let teks=document.getElementById("inputBelva").value;
        let key=document.getElementById("keyBelva").value;
        let output="";

        if(mode=="vigenere") output=this.vigenereEnc(teks,key);
        else if(mode=="affine"){ 
            let p=key.split(","); 
            output=this.affineEnc(teks,parseInt(p[0]),parseInt(p[1])); 
        }
        else if(mode=="playfair") output=this.playfair(teks,key,"enc");
        else if(mode=="enigma") output=this.enigmaProses(teks,key);
        else if(mode=="hill") output=this.hill2x2Enc(teks,key);

        document.getElementById("outputBelva").value=output;
    },

    decryptNow(){
        let mode=document.getElementById("pilihCipher").value;
        let teks=document.getElementById("inputBelva").value;
        let key=document.getElementById("keyBelva").value;
        let output="";

        if(mode=="vigenere") output=this.vigenereDec(teks,key);
        else if(mode=="affine"){ 
            let p=key.split(","); 
            output=this.affineDec(teks,parseInt(p[0]),parseInt(p[1])); 
        }
        else if(mode=="playfair") output=this.playfair(teks,key,"dec");
        else if(mode=="enigma") output=this.enigmaProses(teks,key);
        else if(mode=="hill") output=this.hill2x2Dec(teks,key);

        document.getElementById("outputBelva").value=output;
    },

    resetAll(){
        document.getElementById("inputBelva").value="";
        document.getElementById("outputBelva").value="";
        document.getElementById("keyBelva").value="";
    }

};