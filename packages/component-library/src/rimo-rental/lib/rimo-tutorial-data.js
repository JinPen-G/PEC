export default {
  "title": "公務車預約管理服務",
  "subtitle": "線上操作教學",
  "description": "本教學提供企業導入公務車服務後，管理員、主管與員工在企業端與 APP 中常用功能的操作指引。",
  "updatedAt": "2026-06-10",
  "roles": [
    {
      "id": "head_admin",
      "name": "總公司管理員",
      "description": "負責企業整體公務車服務設定、分公司管理、合約配額、車輛資產與跨分公司調撥。",
      "sections": [
        {
          "id": "head-branch",
          "title": "建立分公司帳號與分配可用據點",
          "summary": "總公司管理員先建立分公司，再分配該分公司可使用的公務車據點。",
          "path": "企業端 / 公務車服務管理 / 分公司管理",
          "steps": [
            {
              "text": "進入分公司管理頁面，點擊新增分公司。",
              "images": [
                {
                  "src": "images/ScreenShot_2026-06-10_161843_013.png",
                  "caption": "進入分公司管理頁面"
                },
                {
                  "src": "images/ScreenShot_2026-06-10_161908_348.png",
                  "caption": "點擊新增分公司"
                }
              ]
            },
            {
              "text": "填寫分公司名稱、管理員資訊與聯絡資料。",
              "images": [
                {
                  "src": "images/ScreenShot_2026-06-10_161916_816.png",
                  "caption": "填寫分公司資料"
                }
              ]
            },
            {
              "text": "選擇該分公司可使用的據點。",
              "images": [
                {
                  "src": "images/ScreenShot_2026-06-10_161924_527.png",
                  "caption": "選擇可用據點"
                }
              ]
            },
            {
              "text": "確認資料後儲存。",
              "images": []
            }
          ],
          "images": [],
          "notes": [
            "可用據點會影響該分公司員工可看到與可預約的車輛範圍。",
            "分公司只可管理資產歸屬於本分公司的車輛。"
          ]
        },
        {
          "id": "head-contract",
          "title": "分配車輛配額給各分公司",
          "summary": "總公司將採購的合約車輛額度，分配給各公司。\n(各分司新增車輛綁定有效合約後 ，員工即可開始用APP預約車輛)",
          "path": "企業端 / 合約與配額管理",
          "steps": [
            {
              "text": "進入「公務車管理」>「合約配額管理」功能",
              "images": []
            },
            {
              "text": "「合約配額管理」功能，版面功能說明如下:",
              "images": [
                {
                  "src": "images/tutorial_20260708065245_3196.png",
                  "caption": "截圖 2026-07-08 下午2.52.08.png"
                }
              ]
            },
            {
              "text": "欲分配合約時，請選擇要分配的合約，點選「分配配額」",
              "images": [
                {
                  "src": "images/tutorial_20260708101206_1007.png",
                  "caption": "截圖 2026-07-08 下午6.11.50.png"
                }
              ]
            },
            {
              "text": "選擇「分公司」及要分配的數量，按「儲存」\n註: 分配好後，該分公司管理人員，即可登入帳號，配對車號",
              "images": [
                {
                  "src": "images/tutorial_20260708102939_2029.png",
                  "caption": "截圖 2026-07-08 下午6.29.08.png"
                }
              ]
            },
            {
              "text": "若要查看或變更合約分配狀況，可按「分配明細」查詢，並按操作「調整」功能，調整各分公司合約的配額",
              "images": [
                {
                  "src": "images/tutorial_20260708103459_9875.png",
                  "caption": "截圖 2026-07-08 下午6.34.33.png"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        },
        {
          "id": "head-transfer",
          "title": "員工審核",
          "summary": "當員工用boocar APP註冊完帳號，並申請加入公司時，需總公司管理人員審核通過，方可開始預約公司的車輛。",
          "path": "組織管理/員工審核",
          "steps": [
            {
              "text": "進入「組織管理」>「員工審核」功能",
              "images": []
            },
            {
              "text": "檢視員工資訊，操作是否同意該員工加入。審核通過或不通過，該申請的員工會收到推播的通知。\n若一次要審核多筆，可勾選多筆後，按左上方的「批次通過」或「批次不通過」",
              "images": [
                {
                  "src": "images/tutorial_20260709052318_8877.png",
                  "caption": "審核.png"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        }
      ]
    },
    {
      "id": "branch_admin",
      "name": "分公司管理員",
      "description": "負責本分公司車輛資料、部門、員工審核、預約審核與清潔保養提醒處理。",
      "sections": [
        {
          "id": "section_1783575036702_352",
          "title": "登入分公司帳號",
          "summary": "當總公司開好各分公司的帳號後，分公司的管理人員的信箱，會收到boocar寄送的帳號開通知知信，信件內容如下:",
          "path": "",
          "steps": [
            {
              "text": "請分公司管理人員至個人信箱，點開boocar寄發的通知信，上面有登錄的資訊，請依通知信的步驟登入平台",
              "images": [
                {
                  "src": "images/tutorial_20260709053525_9735.png",
                  "caption": "截圖 2026-07-09 下午1.33.39.png"
                }
              ]
            },
            {
              "text": "為了您帳號的安全，首次登入請更改密碼，並妥善保管您的密碼",
              "images": [
                {
                  "src": "images/tutorial_20260709055201_7936.png",
                  "caption": "更改密碼.png"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        },
        {
          "id": "branch-approval",
          "title": "新增車輛",
          "summary": "分公司人員透過此功能將總公司分配的車輛建在分公司的群組裡",
          "path": "公務車管理>公務車輛管理",
          "steps": [
            {
              "text": "進入「公務車管理>公務車輛管理」功能，點選右上角「+新增車輛」",
              "images": [
                {
                  "src": "images/tutorial_20260827065927_5872.png",
                  "caption": "截圖 2026-08-27 下午2.57.59.png"
                }
              ]
            },
            {
              "text": "依序填入車輛資訊，「* 」為必填項目",
              "images": [
                {
                  "src": "images/tutorial_20260827071824_0169.png",
                  "caption": "截圖 2026-08-27 下午3.00.43.png"
                }
              ]
            },
            {
              "text": "新增完車輛，回到車輛列表，進行車輛與合約的綁定",
              "images": [
                {
                  "src": "images/tutorial_20260827073246_5262.png",
                  "caption": "截圖 2026-08-27 下午3.19.57.png"
                }
              ]
            },
            {
              "text": "綁換合約畫面如下，先選擇所在分公司，系統會自動比對已分配到此分公司且可綁定的合約。",
              "images": [
                {
                  "src": "images/tutorial_20260827073849_0963.png",
                  "caption": "截圖 2026-08-27 下午3.36.44.png"
                }
              ]
            },
            {
              "text": "合約綁定成功 。當車輛列表出現「上架」且已有合約編號，表示綁定成功",
              "images": [
                {
                  "src": "images/tutorial_20260827074238_1210.png",
                  "caption": "截圖 2026-08-27 下午3.39.25.png"
                }
              ]
            },
            {
              "text": "合約未到期前，若更換車輛，請先換綁合約功能，選定要移除合約的車輛，點選「解除目前合約的綁定」，再重新將此合約剩餘的期數，綁定在新的車輛。解綁定畫面如下:",
              "images": [
                {
                  "src": "images/tutorial_20260827074637_4678.png",
                  "caption": "截圖 2026-08-27 下午3.44.41.png"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        },
        {
          "id": "branch-vehicle",
          "title": "建立部門",
          "summary": "建立可預約車輛的部門，可分析各部門車輛的使用狀況",
          "path": "組織管理>部門管理",
          "steps": [
            {
              "text": "進入組織管理>部門管理功能，選擇左上角「+新增部門」",
              "images": [
                {
                  "src": "images/tutorial_20260827080206_7745.png",
                  "caption": "截圖 2026-08-27 下午3.58.48.png"
                }
              ]
            },
            {
              "text": "輸入部門名稱，完成新增部門",
              "images": [
                {
                  "src": "images/tutorial_20260827080408_1534.png",
                  "caption": "截圖 2026-08-27 下午4.03.52.png"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        },
        {
          "id": "branch-reminder",
          "title": "設定各部門可用車輛",
          "summary": "建立在分公司下的車輛，原則上是該分公司的成員，經審核過後，都可以預約該分公司所有車輛。\n若一個公分司各部門可使用的輛是分開的，則可透過「限定用車」來設定。",
          "path": "公務車管理>限定用車",
          "steps": [
            {
              "text": "進入「公務車管理>限定用車」功能，點選左上角「+新增」",
              "images": [
                {
                  "src": "images/tutorial_20260827083622_2574.png",
                  "caption": "截圖 2026-08-27 下午4.35.20.png"
                }
              ]
            },
            {
              "text": "設定用車權限",
              "images": [
                {
                  "src": "images/tutorial_20260827102139_8612.png",
                  "caption": "截圖 2026-08-27 下午4.44.58.png"
                }
              ]
            },
            {
              "text": "設定完成後，只有限定的使用人在預約時，才會看到這些車輛",
              "images": [
                {
                  "src": "images/tutorial_20260827102443_8972.png",
                  "caption": "截圖 2026-08-27 下午6.23.30.png"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        },
        {
          "id": "section_1787816997433_114",
          "title": "設定預約審核",
          "summary": "員工預約車輛，是否需要主管審核，可在此功能設定。亦可設定第二審核人員。",
          "path": "公務車管理>審批設定",
          "steps": [
            {
              "text": "1、若要開啟預約審核功能，進入「公務車管理>審批設定」功能，勾選「啟用」預約用車審核。\n2、若要設定第二審核人員，則開啟「限時審批」，並在右方設定第二審批人。\n例:審核時間設定10分，意指當主管為審核此預約時，10分鐘後，可由第二審批人審核。",
              "images": [
                {
                  "src": "images/tutorial_20260828050854_1928.png",
                  "caption": "截圖 2026-08-28 上午11.54.08.png"
                }
              ]
            }
          ],
          "images": [],
          "notes": [
            "總公司或分公司boocar後台管理人員，均可在後端審核此訂單"
          ]
        }
      ]
    },
    {
      "id": "employee",
      "name": "員工 / 用車人",
      "description": "負責在 APP 端加入企業、提交公務車預約、查看訂單與取消預約。",
      "sections": [
        {
          "id": "section_1787826824989_903",
          "title": "註冊會員",
          "summary": "請欲使用公務車的會員，先註冊boocar會員帳號",
          "path": "",
          "steps": [
            {
              "text": "下載boocar APP",
              "images": [
                {
                  "src": "images/tutorial_20260827103538_6270.png",
                  "caption": "截圖 2026-08-27 下午6.33.30.png"
                }
              ]
            },
            {
              "text": "填寫會員資料，註冊成為boocar會員",
              "images": [
                {
                  "src": "images/tutorial_20260827104039_3662.png",
                  "caption": "IMG_2012.PNG"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        },
        {
          "id": "employee-join",
          "title": "加入企業身份",
          "summary": "員工以個人會員帳號登入 APP 後，可申請加入企業，經該企業管理人員審核通過後，即可開始使用boocar預約車輛",
          "path": "會員中心>基本資料設定>會員資料",
          "steps": [
            {
              "text": "註冊完成後，會自動連結到加入企業的頁面。輸入企業代碼 ，選擇部門及職等後，該公司的管理人員平台帳號，會收到員工申請加入公司的待審核通知",
              "images": [
                {
                  "src": "images/tutorial_20260827110137_2169.png",
                  "caption": "截圖 2026-08-27 晚上7.01.27.png"
                }
              ]
            },
            {
              "text": "當總公司管理人員審核申請後，該員工即會收到推播通知，即可開始預約該公司的車輛",
              "images": [
                {
                  "src": "images/tutorial_20260827110657_2498.png",
                  "caption": "截圖 2026-08-27 晚上7.06.41.png"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        },
        {
          "id": "employee-book",
          "title": "預約公務車",
          "summary": "員工依可用據點與車輛狀態，預約用車",
          "path": "公務車 APP / 預約用車",
          "steps": [
            {
              "text": "選擇用車時間，系統會自動篩選該時段有公務車可預約的據點，用車人依需求選擇取車的據點",
              "images": [
                {
                  "src": "images/tutorial_20260828022119_6217.png",
                  "caption": "IMG_2017.PNG"
                }
              ]
            },
            {
              "text": "選擇要租用的車輛。進入取車據點，在車輛清單中，選擇要預約的車輛",
              "images": [
                {
                  "src": "images/tutorial_20260828024646_9206.png",
                  "caption": "IMG_2018.PNG"
                }
              ]
            },
            {
              "text": "設定取還車時間，輸入出勤地點、事由及搭乘人數",
              "images": [
                {
                  "src": "images/tutorial_20260828024656_6888.png",
                  "caption": "IMG_2019.PNG"
                }
              ]
            },
            {
              "text": "提交預約。若企業啟用預約審核，需等待主管或分公司管理員審核通過。企業若設定預約不需審核，或該預約人員為主管，則不需審核即完成預約",
              "images": [
                {
                  "src": "images/tutorial_20260828025247_7522.png",
                  "caption": "IMG_2025.PNG"
                }
              ]
            },
            {
              "text": "預約審核通過。當用車預約送交主管審核，當主管審核通過後，預約人會被到推播通知。在預約用車前10分鐘可「取車」，若臨時要取消訂單，亦可在此取消",
              "images": [
                {
                  "src": "images/tutorial_20260828025726_1761.png",
                  "caption": "IMG_2026.PNG"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        },
        {
          "id": "employee-order",
          "title": "取車",
          "summary": "於預約用車時間10分鐘前，用車人完成取車前的操作，即可開始用車。亦可在用車期間，延長用車及回報異常車況。",
          "path": "公務車 APP / 我的訂單",
          "steps": [
            {
              "text": "進入我的訂單頁面。",
              "images": [
                {
                  "src": "images/tutorial_20260828032620_8313.png",
                  "caption": "IMG_2028.PNG"
                }
              ]
            },
            {
              "text": "可查詢到已預約的訂單",
              "images": [
                {
                  "src": "images/tutorial_20260828032742_9302.png",
                  "caption": "IMG_2031.PNG"
                }
              ]
            },
            {
              "text": "在預約用車前10分鐘即可進行取車",
              "images": [
                {
                  "src": "images/tutorial_20260828032840_8182.png",
                  "caption": "IMG_2031.PNG"
                }
              ]
            },
            {
              "text": "輸入車上儀表板里程，並拍照留存記錄，送出後即完成取車",
              "images": [
                {
                  "src": "images/tutorial_20260828033019_6092.png",
                  "caption": "IMG_2032.PNG"
                }
              ]
            },
            {
              "text": "用車時間，若要延長用車或有異常車況要回報時，可在「查看詳情」中操作",
              "images": [
                {
                  "src": "images/tutorial_20260828033256_0351.png",
                  "caption": "IMG_2033.PNG"
                }
              ]
            },
            {
              "text": "欲延長用車，點選延長用車按紐，並調整還車時間，系統會自動比對延長用車是否與下一位用車人時間衝突，若有時間衝突，會跳出提醒。",
              "images": [
                {
                  "src": "images/tutorial_20260828033715_3488.png",
                  "caption": "IMG_2035.PNG"
                }
              ]
            },
            {
              "text": "若用車期間，發現車況異常，可訂單詳情中點選「異常回報」，填入異常原因，並拍照佐證，便於責任的釐清",
              "images": [
                {
                  "src": "images/tutorial_20260828033934_5469.png",
                  "caption": "IMG_2036.PNG"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        },
        {
          "id": "section_1787888475696_582",
          "title": "還車",
          "summary": "用車人於用車完畢，可在訂單操作還車",
          "path": "APP/我的訂單",
          "steps": [
            {
              "text": "在我的訂單的訂單詳情，點選「還車」",
              "images": [
                {
                  "src": "images/tutorial_20260828034645_2344.png",
                  "caption": "IMG_2034.PNG"
                }
              ]
            },
            {
              "text": "輸入還車時儀錶板里程及還車的備註(非必填)，即完成還車流程",
              "images": [
                {
                  "src": "images/tutorial_20260828035006_0820.png",
                  "caption": "IMG_2030.PNG"
                }
              ]
            }
          ],
          "images": [],
          "notes": []
        }
      ]
    },
    {
      "id": "role_1787885861549_718",
      "name": "部門主管",
      "description": "",
      "sections": [
        {
          "id": "section_1787885882709_717",
          "title": "主管預約審核",
          "summary": "若企業開啟預約審核功能，當部門員工預約用車後，需部門主管或管理人員，審核該筆預約",
          "path": "APP/我的審核",
          "steps": [
            {
              "text": "若企業開啟預約審核功能，當部門員工預約用車後，該部門主管的手機會收到推播提醒\n註:主管亦需有boocar會員帳號",
              "images": [
                {
                  "src": "images/tutorial_20260828030729_3812.png",
                  "caption": "IMG_2023 2.PNG"
                }
              ]
            },
            {
              "text": "主管登入帳號後，進入「我的審核」功能",
              "images": [
                {
                  "src": "images/tutorial_20260828031053_3022.png",
                  "caption": "IMG_2028.PNG"
                }
              ]
            },
            {
              "text": "查看員工預約的內容，主管選擇「同意」或「駁回」。二個選項送出後，該預約的員工會收到推播通知",
              "images": [
                {
                  "src": "images/tutorial_20260828031305_8113.png",
                  "caption": "審核內容.png"
                }
              ]
            }
          ],
          "images": [],
          "notes": [
            "若審核主管無法即時審核訂單時，亦可透過管理人員帳號，從boocar後台審准該訂單",
            "只有啟用預約審核時才需要主管審核。"
          ]
        }
      ]
    }
  ]
};
