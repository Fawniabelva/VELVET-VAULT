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

    /* VIGENERE */
    vigenereEnc(teks,key){
        teks=this.bersihkan(teks); key=this.bersihkan(key);
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
        teks=this.bersihkan(teks); key=this.bersihkan(key);
        if(key.length==0) return "KEY KOSONG!";
        let hasil="";
        for(let i=0;i<teks.length;i++){
            let c=this.hurufSet.indexOf(teks[i]);
            let k=this.hurufSet.indexOf(key[i%key.length]);
            hasil+=this.hurufSet[this.modAman(c-k,26)];
        }
        return hasil;
    },

    /* AFFINE */
    affineEnc(teks,a,b){
        teks=this.bersihkan(teks);
        if(isNaN(a)||isNaN(b)) return "FORMAT KEY SALAH! (Gunakan a,b)";
        if(this.fpb(a,26)!=1) return "NILAI 'A' TIDAK VALID!";
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
        if(!inv) return "TIDAK ADA INVERS MODULO!";
        let hasil="";
        for(let h of teks){
            let c=this.hurufSet.indexOf(h);
            hasil+=this.hurufSet[this.modAman(inv*(c-b),26)];
        }
        return hasil;
    },

    /* PLAYFAIR */
    buatMatrix(key){
        key=this.bersihkan(key).replace(/J/g,"I");
        let gabungan="";
        for(let h of key){ if(!gabungan.includes(h)) gabungan+=h; }
        for(let h of this.hurufSet){
            if(h!="J" && !gabungan.includes(h)) gabungan+=h;
        }
        return gabungan;
    },

    playfair(teks,key,mode){
        teks=this.bersihkan(teks).replace(/J/g,"I");
        if(key.length==0) return "KEY KOSONG!";
        let matrix=this.buatMatrix(key);
        let hasil="";
        for(let i=0;i<teks.length;i+=2){
            let a=teks[i];
            let b=teks[i+1]||"X";
            if(a==b) b="X";
            let posA=matrix.indexOf(a), posB=matrix.indexOf(b);
            let rA=Math.floor(posA/5), cA=posA%5;
            let rB=Math.floor(posB/5), cB=posB%5;
            if(mode=="enc"){
                if(rA==rB){ hasil+=matrix[rA*5+this.modAman(cA+1,5)] + matrix[rB*5+this.modAman(cB+1,5)]; }
                else if(cA==cB){ hasil+=matrix[this.modAman(rA+1,5)*5+cA] + matrix[this.modAman(rB+1,5)*5+cB]; }
                else { hasil+=matrix[rA*5+cB] + matrix[rB*5+cA]; }
            } else {
                if(rA==rB){ hasil+=matrix[rA*5+this.modAman(cA-1,5)] + matrix[rB*5+this.modAman(cB-1,5)]; }
                else if(cA==cB){ hasil+=matrix[this.modAman(rA-1,5)*5+cA] + matrix[this.modAman(rB-1,5)*5+cB]; }
                else { hasil+=matrix[rA*5+cB] + matrix[rB*5+cA]; }
            }
        }
        return hasil;
    },

    /* HILL */
    hillEnc(teks,key){
        teks=this.bersihkan(teks);
        let k=key.split(",").map(Number);
        if(k.length!=4) return "KEY HARUS 4 ANGKA!";
        let det=this.modAman(k[0]*k[3]-k[1]*k[2],26);
        if(this.fpb(det,26)!=1) return "DETERMINAN TIDAK PUNYA INVERS!";
        let hasil="";
        for(let i=0;i<teks.length;i+=2){
            let p1=this.hurufSet.indexOf(teks[i]), p2=this.hurufSet.indexOf(teks[i+1]||"X");
            hasil+=this.hurufSet[this.modAman(k[0]*p1+k[1]*p2,26)];
            hasil+=this.hurufSet[this.modAman(k[2]*p1+k[3]*p2,26)];
        }
        return hasil;
    },

    hillDec(teks,key){
        teks=this.bersihkan(teks);
        let k=key.split(",").map(Number);
        if(k.length!=4) return "KEY HARUS 4 ANGKA!";
        let det=this.modAman(k[0]*k[3]-k[1]*k[2],26);
        let detInv=this.inversMod(det,26);
        if(!detInv) return "TIDAK ADA INVERS MATRIKS!";
        let inv=[this.modAman(detInv*k[3],26), this.modAman(-detInv*k[1],26), this.modAman(-detInv*k[2],26), this.modAman(detInv*k[0],26)];
        let hasil="";
        for(let i=0;i<teks.length;i+=2){
            let c1=this.hurufSet.indexOf(teks[i]), c2=this.hurufSet.indexOf(teks[i+1]);
            hasil+=this.hurufSet[this.modAman(inv[0]*c1+inv[1]*c2,26)];
            hasil+=this.hurufSet[this.modAman(inv[2]*c1+inv[3]*c2,26)];
        }
        return hasil;
    },

    /* ENIGMA */
    rotor: "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
    reflector: "YRUHQSLDPXNGOKMIEBFZCWVJAT",
    enigmaProses(teks){
        teks=this.bersihkan(teks);
        let hasil="", geser=0;
        for(let h of teks){
            let index=this.hurufSet.indexOf(h);
            let masuk=this.modAman(index+geser,26);
            let step1=this.rotor[masuk];
            let reflect=this.reflector[this.hurufSet.indexOf(step1)];
            let keluarIndex=this.rotor.indexOf(reflect);
            let finalIndex=this.modAman(keluarIndex-geser,26);
            hasil+=this.hurufSet[finalIndex];
            geser=(geser+1)%26;
        }
        return hasil;
    },

    /* CONTROLLER */
    encryptNow(){
        let mode=document.getElementById("pilihCipher").value;
        let teks=document.getElementById("inputBelva").value;
        let key=document.getElementById("keyBelva").value;
        let output="";
        if(mode=="vigenere") output=this.vigenereEnc(teks,key);
        else if(mode=="affine"){ let p=key.split(","); output=this.affineEnc(teks,parseInt(p[0]),parseInt(p[1])); }
        else if(mode=="playfair") output=this.playfair(teks,key,"enc");
        else if(mode=="hill") output=this.hillEnc(teks,key);
        else if(mode=="enigma") output=this.enigmaProses(teks);
        document.getElementById("outputBelva").value=output;
    },

    decryptNow(){
        let mode=document.getElementById("pilihCipher").value;
        let teks=document.getElementById("inputBelva").value;
        let key=document.getElementById("keyBelva").value;
        let output="";
        if(mode=="vigenere") output=this.vigenereDec(teks,key);
        else if(mode=="affine"){ let p=key.split(","); output=this.affineDec(teks,parseInt(p[0]),parseInt(p[1])); }
        else if(mode=="playfair") output=this.playfair(teks,key,"dec");
        else if(mode=="hill") output=this.hillDec(teks,key);
        else if(mode=="enigma") output=this.enigmaProses(teks);
        document.getElementById("outputBelva").value=output;
    },

    resetAll(){
        document.getElementById("inputBelva").value="";
        document.getElementById("outputBelva").value="";
        document.getElementById("keyBelva").value="";
    }
};