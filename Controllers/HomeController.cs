using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using Bootstrap_FileUpload.Common;
using Bootstrap_FileUpload.Models;
using Gma.QrCodeNet.Encoding;
using Gma.QrCodeNet.Encoding.Windows.Render;
using ICSharpCode.SharpZipLib.Zip;
using Newtonsoft.Json;


namespace Bootstrap_FileUpload.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public readonly string  Key = "chainway";
        public ActionResult QrCode(List<ApkInfo> apks)
        {

//           string str = formCollection["Json"];
//           List<ApkInfo>  apks = JsonConvert.DeserializeObject<List<ApkInfo>>(str);
           string raw =string.Join(",", apks.Select(t => t.Uri).ToArray());
            
//            List<string> bmps = new List<string>();
            var path = Server.MapPath("~/QrCode");
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            //            string msg = string.Empty;
            //            List<string> failNames = new List<string>();
            //            List<string> successNames = new List<string>();
            //            foreach (var apk in apks)
            //            {
            //                var fileName = apk.Name.Substring(0, apk.Name.LastIndexOf('.')) + ".png";
            //                var filePath = Path.Combine(path, fileName);
            //
            //
            //                successNames.Add(filePath);
            //                if (!this.CreateQR(apk.Uri, filePath))
            //                {
            //                    failNames.Add(fileName);
            //                    continue;
            //                }
            //            }
            //
            //            DownloadFiles(successNames);
           
            var filePath = Path.Combine(path, "qrcode.png");
//            string enstr =
//                "我是一个测试加密的字符串,12132332131321@3333#$%我是一个测试加密的字符串,12132332131321@3333#$%我是一个测试加密的字符串,12132332131321@3333#$%我是一个测试加密的字符串,12132332131321@3333#$%";

            if (this.CreateQR(DesCSharp.DESEnCode(raw, Key), filePath))
            {
                return Json(new {code = 0, msg = "success"});
//                string s = MimeMapping.GetMimeMapping(filePath);
//
//                return File(filePath,s);
            }

            return Json(new { code =-1, msg = "failed" });

        }

        public FileResult ShowImg()
        {
            var filePath = Path.Combine(Server.MapPath("~/QrCode"), "qrcode.png");
            string s = MimeMapping.GetMimeMapping(filePath);            
            return File(filePath,s);
        }

        public ActionResult DownloadFiles(List<string> filePaths)
        {
            string downloadName = "QrCodes.zip";
            HttpContext.Response.Clear();
            HttpContext.Response.AddHeader("content-disposition", "attachment; filename=" + downloadName );
            HttpContext.Response.ContentType = "application/zip";
            HttpContext.Response.CacheControl = "Private";
            HttpContext.Response.Cache.SetExpires(DateTime.Now.AddMinutes(3));
            this.ZipFiles(Server.MapPath("~/QrCode"), filePaths, Path.Combine(Server.MapPath("~/Apks"), downloadName), 1, "", "");
      
            FileStream fs = new FileStream(Path.Combine(Server.MapPath("~/Apks"), downloadName), FileMode.Open);
            byte[] bytes = new byte[(int)fs.Length];
            fs.Read(bytes, 0, bytes.Length);
            fs.Close();
            Response.Charset = "UTF-8";
            Response.ContentType = "application/octet-stream";
            Response.ContentEncoding = Encoding.Default;
            Response.AddHeader("Content-Disposition", "attachment; filename=" + downloadName);
            Response.BinaryWrite(bytes);
            Response.Flush();
            Response.End();
            return new EmptyResult();
        }

        private FileResult DownloadZipToBrowser(string zipPath)
        {
           
            string s = MimeMapping.GetMimeMapping(zipPath);

            return File(zipPath, "application/x-zip-compressed");
        }


        #region 制作压缩包（多个文件压缩到一个压缩包，支持加密、注释）  
        /// <summary>  
        /// 制作压缩包（多个文件压缩到一个压缩包，支持加密、注释）  
        /// </summary>  
        /// <param name="topDirectoryName">压缩文件目录</param>  
        /// <param name="zipedFileName">压缩包文件名</param>  
        /// <param name="compresssionLevel">压缩级别 1-9</param>  
        /// <param name="password">密码</param>  
        /// <param name="comment">注释</param>  
        public  void ZipFiles(string topDirectoryName,List<string> successFiles, string zipedFileName, int compresssionLevel, string password, string comment)
        {
            if (System.IO.File.Exists(zipedFileName))
                System.IO.File.Delete(zipedFileName);
            using (ZipOutputStream zos = new ZipOutputStream(System.IO.File.Open(zipedFileName, FileMode.OpenOrCreate)))
            {
                if (compresssionLevel != 0)
                {
                    zos.SetLevel(compresssionLevel);//设置压缩级别  
                }

                if (!string.IsNullOrEmpty(password))
                {
                    zos.Password = password;//设置zip包加密密码  
                }

                if (!string.IsNullOrEmpty(comment))
                {
                    zos.SetComment(comment);//设置zip包的注释  
                }

                //循环设置目录下所有的*.jpg文件（支持子目录搜索）  
                foreach (string file in Directory.GetFiles(topDirectoryName, "*", SearchOption.AllDirectories))
                {
                    if (System.IO.File.Exists(file)&&successFiles.Contains(file))
                    {
                        FileInfo item = new FileInfo(file);
                        FileStream fs = System.IO.File.OpenRead(item.FullName);
                        byte[] buffer = new byte[fs.Length];
                        fs.Read(buffer, 0, buffer.Length);

                        ZipEntry entry = new ZipEntry(item.Name);
                        zos.PutNextEntry(entry);
                        zos.Write(buffer, 0, buffer.Length);
                    }
                }
            }
        }
        #endregion
        private bool CreateQR(string strcode, MemoryStream ms)
        {
            QuietZoneModules QuietZones = QuietZoneModules.Two;  //空白区域   
            int ModuleSize = 12;//大小  
            QrEncoder qrEncoder = new QrEncoder(ErrorCorrectionLevel.H);
            QrCode code = new QrCode();
            if (qrEncoder.TryEncode(strcode, out code))
            {
                GraphicsRenderer render = new GraphicsRenderer(new FixedModuleSize(ModuleSize, QuietZones), Brushes.Black,
                                     Brushes.White);
                render.WriteToStream(code.Matrix, ImageFormat.Png, ms);

            }
            else { return false; }

            return true;

        }

        private bool CreateQR(string strCode, string imgPath)
        {
            QuietZoneModules QuietZones = QuietZoneModules.Two;  //空白区域   
            int ModuleSize = 12;//大小  
            QrEncoder qrEncoder = new QrEncoder(ErrorCorrectionLevel.H);
            QrCode code = new QrCode();
            if (qrEncoder.TryEncode(strCode, out code))
            {
                GraphicsRenderer render = new GraphicsRenderer(new FixedModuleSize(ModuleSize, QuietZones), Brushes.Black,
                    Brushes.White);

                using (FileStream stream = new FileStream(imgPath, FileMode.Create))
                {
                    render.WriteToStream(code.Matrix, System.Drawing.Imaging.ImageFormat.Png, stream);
                }
            }
            else { return false; }

            return true;

        }

        public JsonResult Upload()
        {
            var files = Request.Files;
            if (files == null || !files.AllKeys.Any())
            {
                return Json(new {code = -1, msg = "upload failed!"}, JsonRequestBehavior.AllowGet);
            }

            var oFile = Request.Files[0];
            if (!Directory.Exists(Server.MapPath("~/Apks")))
            {
                Directory.CreateDirectory(Server.MapPath("~/Apks"));
            }
            var path = Path.Combine(Server.MapPath("~/Apks"), oFile.FileName);
            if (Directory.Exists(path))
                Directory.Delete(path);
            oFile.SaveAs(path);
            return Json(new{code=0,msg="upload completed!"},JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetApkInfos()
        {
            var scheme = Request.Url.Scheme;
            var root = Request.Url.Authority;
            var currentSUrl = $"{scheme}://{root}";
            var path = Server.MapPath("~/Apks");
            if (!Directory.Exists(path))
            {
                return null;
            }

            var url = Request.Url;
            DirectoryInfo dinfo = new DirectoryInfo(path);
            FileInfo[] finfos = dinfo.GetFiles();
            var lstRes = new List<ApkInfo>();
            foreach (var fileInfo in finfos)
            {
                var temp = $"{currentSUrl}/Apks/{fileInfo.Name}";
//                var encry = Des3Util.encrypt("chainway", temp);
                var oModel = new ApkInfo { Id = Guid.NewGuid().ToString(), Name = fileInfo.Name, Size = $"{fileInfo.Length/1024/1024}mb"
                    , UploadDate = fileInfo.CreationTime.ToShortDateString(), Uri = $"{currentSUrl}/Apks/{fileInfo.Name}" 
                };

                lstRes.Add(oModel);
            }
           

//            for (var i = 0; i < 50; i++)
//            {
//                var oModel = new ApkInfo {Id = Guid.NewGuid().ToString(), Name = "Apk" + i,Size=$"{(i+1)*1024}kb",UploadDate=DateTime.Now.AddHours(5).ToShortDateString(),Uri= Request.Url.ToString() };
//
//                lstRes.Add(oModel);
//            }

//            var total = lstRes.Count;
//            var rows = lstRes.Skip(offset).Take(limit).ToList();
//            return Json(new { total = total, rows = rows }, JsonRequestBehavior.AllowGet);
            return Json(lstRes,JsonRequestBehavior.AllowGet);
        }

    }
}