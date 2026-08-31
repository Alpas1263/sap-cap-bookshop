# SAP CAP Bookshop

## Proje Hakkında

SAP CAP/CDS 10 ve SQLite kullanan bir kitap yönetimi uygulamasıdır. CAP servisleri ile Vanilla HTML, CSS ve JavaScript tabanlı CRUD arayüzü aynı yerel sunucuda çalışır. Kullanıcılar kitapları görüntüleyebilir, ekleyebilir, düzenleyebilir ve silebilir.

Bu README, projeyi daha önce hiç bulunmadığı Windows 11 bilgisayarına Visual Studio Code üzerinden GitHub'dan indirip çalıştırmak için gereken tüm adımları içerir.

## Gereksinimler

- Windows 11
- Git
- Visual Studio Code
- Node.js 22 veya üzeri
- Node.js ile birlikte gelen npm
- İlk indirme ve paket kurulumu için internet bağlantısı

Node.js 22 gereksinimi, projedeki `@sap/cds` 10 paketinin `package-lock.json` içinde tanımlanan `node >=22` koşulundan gelir.

Global `@sap/cds-dk`, ayrı bir SQLite programı veya veritabanı sunucusu kurmak gerekmez. CAP ve SQLite araçları projenin npm bağımlılıkları olarak yerel şekilde kurulur.

Bu rehberde proje Visual Studio Code ile indirilecek, açılacak ve çalıştırılacaktır. Bu nedenle Visual Studio Code kurulumu gereklidir.

Git ve Node.js kurulumlarını aşağıdaki resmi adreslerden yapabilirsiniz:

- Git for Windows: <https://git-scm.com/download/win>

  [▶ Git for Windows kurulum videosunu oynat](https://github.com/Alpas1263/sap-cap-bookshop/raw/refs/heads/2/Videolar/git-for-windows.mp4)

- Visual Studio Code: <https://code.visualstudio.com/download>
- Node.js: <https://nodejs.org/en/download>

Programları kurduktan sonra Visual Studio Code'u kapatıp yeniden açın. VS Code içinde **Sol üstte 3 çizgi olacak oradan Terminal > New Terminal** seçeneğiyle bir terminal açıp sürümleri doğrulayın:

```powershell
git --version
node --version
npm.cmd --version
```

`node --version` çıktısı `v22` veya daha yüksek olmalıdır. VS Code'un PowerShell terminali `npm.ps1` dosyasını çalıştırmayı engelleyebildiği için Windows komutlarında güvenli biçimde `npm.cmd` ve `npx.cmd` kullanılmıştır.

## 1. Projeyi VS Code ile GitHub'dan İndirme

1. Visual Studio Code'u açın.
2. `Ctrl+Shift+P` tuşlarına basarak Command Palette'i açın.
3. **Git: Clone** komutunu seçin.
4. Repository adresi istendiğinde şunu yapıştırın:

   ```text
   https://github.com/Alpas1263/sap-cap-bookshop.git
   ```

5. Projenin indirileceği üst klasörü seçin. VS Code burada `sap-cap-bookshop` klasörünü oluşturur.
6. İndirme tamamlanınca çıkan bildirimde **Open** seçeneğine basın.
7. VS Code çalışma alanına güvenip güvenmediğinizi sorarsa repository'yi doğruladıktan sonra **Yes, I trust the authors** seçeneğini kullanın.
8. VS Code menüsünden **Terminal > New Terminal** ile proje terminalini açın.

Terminalin doğru klasörde olduğunu kontrol edin:

```powershell
Get-ChildItem
```

Listede `package.json`, `package-lock.json`, `app`, `db` ve `srv` bulunmalıdır. Bundan sonraki bütün komutları bu VS Code terminalinde çalıştırın.

## 2. Bağımlılıkları Kurma

Projede `package-lock.json` bulunduğu için sıfır ve tekrarlanabilir kurulumda `npm ci` tercih edilir:

```powershell
npm.cmd ci
```

Bu işlem `node_modules` klasörünü oluşturur ve `@sap/cds` ile `@cap-js/sqlite` dahil kilit dosyasındaki paketleri kurar. `node_modules` GitHub'dan indirilmez ve Git tarafından izlenmez.

Yerel CAP aracını doğrulayın:

```powershell
npx.cmd cds --version
```

Bu komut proje içindeki CAP bağımlılığını kullanır; global `cds` kurulumu gerektirmez.

## 3. SQLite Veritabanını Oluşturma

Proje, kök dizindeki kalıcı `db.sqlite` dosyasını kullanır. Bu dosya `.gitignore` içindeki `*.sqlite` kuralı nedeniyle GitHub'dan gelmez. Yeni bilgisayarda veritabanını oluşturmak için çalıştırın:

```powershell
npx.cmd cds deploy --to sqlite
```

PowerShell dışındaki bir terminalde aynı komut `npx cds deploy --to sqlite` şeklinde de çalıştırılabilir. `npx`, global paket yerine `npm ci` ile kurulan proje bağımlılığını kullanır.

Komut:

- `db/schema.cds` modelinden SQLite tablolarını oluşturur.
- `db/data/` altındaki kitap, yazar, tür ve para birimi CSV dosyalarını otomatik yükler.
- Proje kökünde `db.sqlite` dosyasını üretir.

CSV dosyalarını elle içe aktarmayın. `npx cds deploy` yerine hedefi açıkça belirten `npx.cmd cds deploy --to sqlite` komutunu kullanın.

> Bu deploy komutu sıfır kurulum içindir. İçinde önemli yerel veriler bulunan mevcut bir `db.sqlite` üzerinde yeniden deploy etmek verileri yeniden kurabilir.

## 4. Projeyi Çalıştırma

Normal kullanım için önerilen komut:

```powershell
npm.cmd start
```

Bu script `package.json` içindeki `cds-serve` komutunu çalıştırır.

Geliştirme sırasında dosya değişikliklerini izleyip sunucuyu otomatik yenilemek için:

```powershell
npm.cmd run watch
```

İki komuttan yalnızca birini çalıştırın. Sunucu açık kalacağı için terminali kapatmayın. Durdurmak için terminalde `Ctrl+C` tuşlarına basın.

## 5. Tarayıcıdan Açma

CAP'in varsayılan portu başka bir ayarla değiştirilmediyse uygulamayı şu adresten açın:

<http://localhost:4004/>

Bu adres `app/` klasöründeki kitap yönetimi arayüzünü gösterir. Başlangıç CSV verileri doğru yüklenmişse beş kitap kaydı görünür.

## 6. Servisler

- `GET /admin/Books`: Kitapları listeler.
- `POST /admin/Books`: Kitap oluşturur.
- `PATCH /admin/Books(<ID>)`: Kitabı günceller.
- `DELETE /admin/Books(<ID>)`: Kitabı siler.
- `/admin/Authors`: Yazarları ve kitap ilişkilerini sunar.
- `/admin/Genres`: Hiyerarşik tür kayıtlarını sunar.
- `/admin/Currencies`: Arayüzün para birimi listesini sağlar.
- `GET /browse/Books`: Yazar ve tür adları düzleştirilmiş salt okunur kataloğu sunar.
- `POST /browse/submitOrder`: Kitap ID'si ve pozitif tam sayı miktarı alarak stoğu atomik biçimde azaltır; kimliği doğrulanmış kullanıcı gerektirir.
- `/admin/$metadata` ve `/browse/$metadata`: OData V4 servis tanımlarıdır.

Tarayıcıda denenebilecek örnek adresler:

```text
http://localhost:4004/admin/Books?$select=ID,title,stock,price
http://localhost:4004/browse/Books?$select=ID,title,author,genre,stock
http://localhost:4004/admin/Authors?$select=ID,name&$expand=books($select=ID,title)
```

## 7. Testler

Testleri proje kökünde çalıştırın:

```powershell
npm.cmd test
```

Test scripti Node.js'in yerleşik test aracını kullanır. Test kodu boş bir port seçerek geçici CAP sunucusunu başlatır ve test profilindeki `:memory:` SQLite veritabanını kullanır. Bu nedenle proje kökündeki kalıcı `db.sqlite` dosyasını değiştirmez veya silmez.

Testler katalog sorgularını, entity ilişkilerini, siparişle stok azaltmayı ve yönetim servisi doğrulamalarını kontrol eder.

> Mevcut `2` branch'i doğrulanırken 4 testten 3'ü geçti. `admin constraints reject invalid book data` testi, servis `400` döndürürken test `412` beklediği için başarısız oldu. Bu, kurulum veya SQLite deploy hatası değil; branch'teki test beklentisi ile mevcut CAP yanıtı arasındaki uyuşmazlıktır.

## Daha Sonra Tekrar Çalıştırma

Bilgisayar yeniden başlatıldığında paketleri ve veritabanını tekrar kurmanız gerekmez:

```powershell
cd "C:\Users\KULLANICI_ADINIZ\Documents\sap-cap-bookshop"
npm.cmd start
```

## GitHub'dan Güncellemeleri Alma

Önce yerel değişiklikleri kontrol edin:

```powershell
git status
```

Çalışma alanı temizse açık branch'in güncellemelerini alın:

```powershell
git pull
```

`package-lock.json` değiştiyse ardından `npm.cmd ci` çalıştırın. Yerel değişiklik varken `git pull` çakışmaya yol açabilir; değişikliklerinizi silmeden önce commit etme veya güvenli biçimde saklama kararı verin.

## Sorun Giderme

### `git`, `node` veya `npm` bulunamıyor

Kurulumdan sonra açık terminalleri ve VS Code'u kapatıp yeniden açın. Komutları tekrar deneyin. Sorun sürerse programları kurarken PATH seçeneğinin etkin olduğundan emin olun.

### PowerShell `npm.ps1` hatası veriyor

Yürütme politikasını değiştirmek yerine bu README'deki gibi `npm.cmd` ve `npx.cmd` kullanın.

### `cds` bulunamıyor

Global `cds` kullanmayın. Önce bağımlılıkları kurup yerel aracı çağırın:

```powershell
npm.cmd ci
npx.cmd cds --version
```

### `db.sqlite` oluşmadı veya başlangıç kayıtları yok

`package.json` dosyasının bulunduğu proje kökünde olduğunuzu doğrulayıp çalıştırın:

```powershell
npx.cmd cds deploy --to sqlite
```

### `localhost:4004` açılmıyor

`npm.cmd start` terminalindeki hata mesajlarını kontrol edin. Terminal kapandıysa sunucu da kapanmıştır. `https` yerine `http://localhost:4004/` adresini kullanın.

### Port 4004 kullanımda

Önce başka bir terminalde çalışan CAP sunucusu varsa `Ctrl+C` ile durdurun. Portu geçici değiştirmek gerekirse:

```powershell
$env:PORT=4005
npm.cmd start
```

Uygulamayı bu kez <http://localhost:4005/> adresinden açın.

### Paket kurulumu başarısız oluyor

İnternet, proxy ve VPN ayarlarını kontrol edip `npm.cmd ci` komutunu yeniden deneyin. Hata mesajını incelemeden `package-lock.json` dosyasını silmeyin.

## Proje Yapısı

```text
sap-cap-bookshop/
├── .vscode/             # VS Code görevleri ve önerilen eklentiler
├── app/                 # Vanilla HTML/CSS/JavaScript CRUD arayüzü
├── db/
│   ├── schema.cds       # Books, Authors ve Genres veri modeli
│   └── data/            # Otomatik yüklenen CSV başlangıç verileri
├── srv/                 # Admin ve katalog CAP servisleri
├── test/                # İzole HTTP entegrasyon testleri
├── .gitignore
├── package.json         # npm scriptleri ve CAP/SQLite yapılandırması
├── package-lock.json    # Kilitlenmiş npm bağımlılıkları
└── README.md
```

`db.sqlite` ve `node_modules` kurulum sırasında yerelde oluşur, GitHub'dan gelmez. `node-ogrenme/` klasörü Bookshop uygulamasının parçası değildir.

## Ekran Görüntüleri

Projeye ait doğrulanmış ekran görüntüleri henüz repository'de bulunmadığı için bu bölüm daha sonra eklenecektir.

## Hızlı Kurulum Özeti

Sıfır Windows 11 bilgisayarda temel sıra:

1. Git, Visual Studio Code ve Node.js 22 veya üzerini kurun.
2. VS Code'da `Ctrl+Shift+P` → **Git: Clone** ile `https://github.com/Alpas1263/sap-cap-bookshop.git` adresini klonlayın.
3. İndirilen projeyi VS Code'da açın.
4. **Terminal > New Terminal** ile terminal açıp sırasıyla çalıştırın:

   ```powershell
   npm.cmd ci
   npx.cmd cds deploy --to sqlite
   npm.cmd start
   ```

5. <http://localhost:4004/> adresini açın.
