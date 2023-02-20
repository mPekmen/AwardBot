import swr from "../../lib/swr";
import Nav from "../../components/Panel/Nav";
import Create from "../../components/Panel/Create";
import Snackbar from "@windui/snackbar";
import Tippy from "@tippyjs/react";
import { useRef, useState, Fragment, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Dialog, Menu, Transition, Switch } from "@headlessui/react";
import JSConfetti from "js-confetti";
import axios from "axios";
import moment from "moment";
import "moment-timezone";

export default function Panel() {
    const { data: _user } = swr("https://api.awardbot.me/v1/auth/me");
	const user = _user ? _user.data : null;

    const { data: _codes, mutate } = swr("https://api.awardbot.me/v1/code/list");
    const codes = _codes ? _codes.data : null;
  let [isOpen, setIsOpen] = useState(false)
  let [loading, setLoading] = useState(false)
  let [success, setSuccess] = useState(false)

  
  let [submitDuration, setSubmitDuration] = useState(Date.now())
  let [submitUses, setSubmitUses] = useState(1)
  let [submitAmount, setSubmitAmount] = useState(1)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }
  useEffect(() => { setSubmitDuration(submitDuration) }, [submitDuration]);
  useEffect(() => { setSubmitUses(submitUses) }, [submitUses]);
  useEffect(() => { setSubmitAmount(submitAmount) }, [submitAmount]);
  const showSnackbar = ({ title, message, type }) => {
    return new Snackbar({
      options: {
        type: type,
      },
      title: title,
      message: message,
    }).show();
  };
  const submitForm = async () => {
    if (loading) return;
    setSuccess(false);
    setLoading(true);
    const _create = await axios.post(
        "https://api.awardbot.me/v1/code/create?_token=" +
        (typeof window !== "undefined"
          ? window.localStorage.getItem("$Award_token")
          : "")+`&u=${submitUses || 1}&a=${submitAmount || 1}&d=${new Date(submitDuration).getTime()}`
    );
    setLoading(false);
    if (_create.data.success == true) {
      new JSConfetti().addConfetti();
      setSuccess("Promocode successfully created: "+_create?.data?.data?.code)
      showSnackbar({
        title: "Yaay!",
        message: `Promocode successfully created.`,
        type: "success",
      });
      setTimeout(() => {
        setSuccess(false);
      }, 5000)
    } else {
      showSnackbar({
        title: "Ooops!",
        message: _create.data.message,
        type: "error",
      });
    }
  };
  const deletePromo = async (id) => {
    if (loading) return;
    setSuccess(false);
    setLoading(true);
    const _create = await axios.get(
        "https://api.awardbot.me/v1/code/delete?_token=" +
        (typeof window !== "undefined"
          ? window.localStorage.getItem("$Award_token")
          : "")+`&i=${id}`
    );
    setLoading(false);
    if (_create.data.success == true) {
      setSuccess("Promocode successfully deleted: "+id)
      showSnackbar({
        title: "Yaay!",
        message: `Promocode successfully deleted.`,
        type: "success",
      });
      setTimeout(() => {
        setSuccess(false);
      }, 5000)
    } else {
      showSnackbar({
        title: "Ooops!",
        message: _create.data.message,
        type: "error",
      });
    }
  };
    return (
        <>
            {(!_user || !user || !_codes || !codes) && <div className="sm:my-10 p-5 lg:p-10 w-full lg:grid lg:grid-cols-5 gap-4">
                <div className="flex col-span-5 items-center justify-center">
                    <i className="fad fa-spinner-third fa-spin text-white text-2xl" />
                </div>
            </div>}
            {(user && codes && !user.permissions.some(_p => _p == "*" || _p == "VIEW_PANEL")) && <div className="sm:my-10 p-5 lg:p-10 w-full lg:grid lg:grid-cols-5 gap-4">
                <div className="flex col-span-5 items-center justify-center">
                    <i className="fa fa-times text-rose-400 text-2xl" />
                    <h6 className="text-rose-400 ml-2">You are not authorized to view this page!</h6>
                </div>
            </div>}
            {(user && codes && user.permissions.some(_p => _p == "*" || _p == "VIEW_PANEL")) && <div className="w-full mt-10">
                <Nav />
              <div className="flex justify-between w-full items-center">
                <h1 className="text-3xl text-white font-bold mt-5">Promocode</h1>
                <button
          type="button"
          onClick={openModal}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Create Promocode
        </button>
              </div>
              <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-5 my-8 overflow-hidden text-left align-middle transition-all transform bg-zinc-900 shadow-xl rounded-2xl">
                <Dialog.Title
                    as="h1"
                    className="text-2xl font-extrabold leading-6 text-white"
                >
                    Create Promocode
                </Dialog.Title>
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-white text-lg">
                      Uses
                    </p>
                    <input
                      id="uses"
                      onChange={e => setSubmitUses(e.target.value)}
                      defaultValue={submitUses}
                      type="number"
                      className="transition w-full duration-200 hover:bg-opacity-50 bg-black bg-opacity-30 text-white focus:text-amber-600 rounded-xl border border-white/10 focus:border-amber-600 focus:outline-none py-4 px-6"
                    />
                  </div>
                  <div>
                    <p className="text-white text-lg">
                      Amount
                    </p>
                    <input
                      id="amount"
                      onChange={e => setSubmitAmount(e.target.value)}
                      defaultValue={submitAmount}
                      type="text"
                      className="transition w-full duration-200 hover:bg-opacity-50 bg-black bg-opacity-30 text-white focus:text-amber-600 rounded-xl border border-white/10 focus:border-amber-600 focus:outline-none py-4 px-6"
                    />
                  </div>
                  <div>
                    <p className="text-white text-lg">
                      Duration
                    </p>
                    <input
                      id="endDate"
                      onChange={e => setSubmitDuration(e.target.value)}
                      defaultValue={submitDuration}
                      type="datetime-local"
                      className="transition w-full duration-200 hover:bg-opacity-50 bg-black bg-opacity-30 text-white focus:text-amber-600 rounded-xl border border-white/10 focus:border-amber-600 focus:outline-none py-4 px-6"
                    />
                  </div>
                </div>

                <div className="flex items-center w-full justify-end space-x-4 mt-4">
                  <button onClick={closeModal} className="text-sm bg-zinc-600/10 outline-none hover:bg-zinc-600/20 px-4 py-2 rounded-md shadow-xl transition-all duration-150 text-white">
                        Cancel
                    </button>
                  <button onClick={() => {
                      closeModal();
                      submitForm();
                  }} className="text-sm bg-green-600 hover:bg-green-700 outline-none px-4 py-2 rounded-md shadow-xl transition-all duration-150 text-white shadow-green-500/20">
                      Create
                    </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
<Transition
  as={Fragment}
  show={success ? true : false}
  enter="ease-out duration-300"
  enterFrom="opacity-0 scale-95"
  enterTo="opacity-100 scale-100"
  leave="ease-in duration-200"
  leaveFrom="opacity-100 scale-100"
  leaveTo="opacity-0 scale-95"
>
  <div className="bg-green-500/20 flex items-center text-green-500 border-2 border-green-500/20 w-full px-4 py-2 mt-2 rounded-lg">
    <i className="fa fa-check-circle text-2xl mr-3" />
    {success || 'null'}
  </div>
</Transition>
<div className="mt-6 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-800 sm:rounded-lg">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-amber-400">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-900 uppercase tracking-wider"
                    >
                      Id
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-900 uppercase tracking-wider"
                    >
                      Code
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-900 uppercase tracking-wider"
                    >
                      Uses
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-900 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-900 uppercase tracking-wider"
                    >
                      Expires At
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-900 uppercase tracking-wider"
                    />
                  </tr>
                </thead>
                <tbody className="bg-black bg-opacity-10 divide-y divide-zinc-800">
                  {(codes || []).map((code, codeIndex) => (
                    <tr key={codeIndex}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          <p className="text-normal">
                            {code.id}
                          </p>
                        </div>
                      </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          <p className="text-normal">
                            {code.code}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white flex items-center">
                          <p className="text-normal">
                            {code.used_by.length}/{code.uses}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          <p className="text-normal">
                            {code.boost_count}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          <p className="text-normal">
                            <Tippy
                                content={moment(Number(code.expires_at)).format(
                                  "dddd, MMMM D, YYYY hh:mm A"
                                )}
                              >
                              <span>
                                {moment(Number(code.expires_at)).format(
                                  "MMMM D, YYYY hh:mm A"
                                )}
                              </span>
                            </Tippy>
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-x-2">
                          <Tippy content="Delete promo">
                            <div
                              onClick={() => deletePromo(code.id)}
                              className="flex w-8 h-8 items-center bg-red-500 hover:opacity-75 p-2 cursor-pointer rounded-md transition-all duration-200 text-white"
                            >
                              <i className="fa fa-trash" />
                            </div>
                          </Tippy>
                          </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
            </div>}
        </>
    );
};